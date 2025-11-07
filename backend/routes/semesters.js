const express = require('express');
const db = require('../database/connection');
const { sendResponse, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all semesters with courses
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM semesters WHERE user_id = ? ORDER BY year, semester', [req.user.userId], (err, semesters) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    // Get courses for each semester
    const semestersWithCourses = semesters.map(semester => {
      return new Promise((resolve) => {
        db.all('SELECT * FROM courses WHERE semester_id = ? AND user_id = ?', [semester.id, req.user.userId], (err, courses) => {
          if (err) {
            resolve({ 
              ...semester, 
              id: semester.id.toString(), // Ensure ID is string
              courses: [] 
            });
          } else {
            resolve({ 
              ...semester, 
              id: semester.id.toString(), // Ensure ID is string
              courses: (courses || []).map(course => ({
                ...course,
                id: course.id.toString() // Ensure course ID is string
              }))
            });
          }
        });
      });
    });
    
    Promise.all(semestersWithCourses).then(semestersData => {
      sendResponse(res, true, 'Semesters retrieved successfully', semestersData);
    });
  });
});

// Cleanup duplicate semesters
router.delete('/cleanup', authenticateToken, (req, res) => {
  // Find and remove duplicate semesters (keep the one with the lowest ID)
  db.all(`
    SELECT year, semester, MIN(id) as keep_id, COUNT(*) as count 
    FROM semesters 
    WHERE user_id = ? 
    GROUP BY year, semester 
    HAVING COUNT(*) > 1
  `, [req.user.userId], (err, duplicates) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    if (duplicates.length === 0) {
      return sendResponse(res, true, 'No duplicates found', { removed: 0 });
    }
    
    // Remove duplicate semesters (keep the one with lowest ID)
    const deletePromises = duplicates.map(duplicate => {
      return new Promise((resolve) => {
        db.run(`
          DELETE FROM semesters 
          WHERE user_id = ? AND year = ? AND semester = ? AND id != ?
        `, [req.user.userId, duplicate.year, duplicate.semester, duplicate.keep_id], function(err) {
          resolve({ removed: this.changes, year: duplicate.year, semester: duplicate.semester });
        });
      });
    });
    
    Promise.all(deletePromises).then(results => {
      const totalRemoved = results.reduce((sum, result) => sum + result.removed, 0);
      sendResponse(res, true, 'Duplicates cleaned up successfully', { 
        removed: totalRemoved,
        details: results 
      });
    });
  });
});

// Create new semester
router.post('/', authenticateToken, (req, res) => {
  const { year, semester } = req.body;
  
  // Check if semester already exists
  db.get('SELECT * FROM semesters WHERE user_id = ? AND year = ? AND semester = ?',
    [req.user.userId, year, semester], (err, existing) => {
      if (err) {
        return sendResponse(res, false, 'Database error', null, 500);
      }
      
      if (existing) {
        return sendResponse(res, false, 'Semester already exists', existing, 400);
      }
      
      // Create new semester
      db.run('INSERT INTO semesters (user_id, year, semester) VALUES (?, ?, ?)',
        [req.user.userId, year, semester], function(err) {
          if (err) {
            return sendResponse(res, false, 'Failed to create semester', null, 500);
          }
          sendResponse(res, true, 'Semester created successfully', { 
            id: this.lastID, 
            year, 
            semester, 
            gpa: 0 
          });
        });
    });
});

// Get courses for a specific semester
router.get('/:id/courses', authenticateToken, (req, res) => {
  const semesterId = req.params.id;
  
  db.all('SELECT * FROM courses WHERE semester_id = ?', [semesterId], (err, courses) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(courses);
  });
});

// Add course to semester
router.post('/:id/courses', authenticateToken, (req, res) => {
  const semesterId = req.params.id;
  const { name, credits, grade, points } = req.body;
  
  db.run('INSERT INTO courses (user_id, semester_id, name, credits, grade, points) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.userId, semesterId, name, credits, grade, points], function(err) {
      if (err) {
        return sendResponse(res, false, 'Failed to add course', null, 500);
      }
      
      // Update semester GPA
      db.all('SELECT * FROM courses WHERE semester_id = ?', [semesterId], (err, courses) => {
        if (courses && courses.length > 0) {
          const totalPoints = courses.reduce((sum, course) => sum + (course.points * course.credits), 0);
          const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
          const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
          
          db.run('UPDATE semesters SET gpa = ? WHERE id = ?', [gpa, semesterId]);
        }
      });
      
      sendResponse(res, true, 'Course added successfully', { 
        id: this.lastID.toString(), 
        name, 
        credits, 
        grade, 
        points 
      });
    });
});

// Delete course
router.delete('/courses/:id', authenticateToken, (req, res) => {
  const courseId = req.params.id;
  
  db.get('SELECT semester_id FROM courses WHERE id = ? AND user_id = ?', [courseId, req.user.userId], (err, course) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found or access denied' });
    }
    
    db.run('DELETE FROM courses WHERE id = ? AND user_id = ?', [courseId, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete course' });
      }
      
      // Update semester GPA
      db.all('SELECT * FROM courses WHERE semester_id = ? AND user_id = ?', [course.semester_id, req.user.userId], (err, courses) => {
        const totalPoints = courses.reduce((sum, course) => sum + (course.points * course.credits), 0);
        const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
        const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
        
        db.run('UPDATE semesters SET gpa = ? WHERE id = ?', [gpa, course.semester_id]);
      });
      
      res.json({ message: 'Course deleted successfully' });
    });
  });
});

module.exports = router;
