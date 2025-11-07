const express = require('express');
const db = require('../database/connection');
const { sendResponse, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get GPA history
router.get('/gpa-history', authenticateToken, (req, res) => {
  db.all('SELECT year, semester, gpa FROM semesters WHERE user_id = ? AND gpa > 0 ORDER BY year, semester', [req.user.userId], (err, history) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    sendResponse(res, true, 'GPA history retrieved successfully', history || []);
  });
});

// Get cumulative GPA
router.get('/cumulative-gpa', authenticateToken, (req, res) => {
  db.all('SELECT s.*, c.* FROM semesters s LEFT JOIN courses c ON s.id = c.semester_id WHERE s.user_id = ?', [req.user.userId], (err, data) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    const allCourses = (data || []).filter(row => row.name).map(row => ({
      name: row.name,
      credits: row.credits,
      points: row.points
    }));
    
    const totalPoints = allCourses.reduce((sum, course) => sum + (course.points * course.credits), 0);
    const totalCredits = allCourses.reduce((sum, course) => sum + course.credits, 0);
    const cumulativeGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    
    sendResponse(res, true, 'Cumulative GPA calculated successfully', { 
      cumulativeGpa, 
      totalCredits, 
      totalCourses: allCourses.length 
    });
  });
});

// Get GPA trend
router.get('/gpa-trend', authenticateToken, (req, res) => {
  db.all('SELECT s.year, s.semester, s.gpa FROM semesters s WHERE s.user_id = ? AND s.gpa > 0 ORDER BY s.year, s.semester', [req.user.userId], (err, data) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    const gpaTrend = (data || []).map(semester => ({
      semester: `Year ${semester.year} - Sem ${semester.semester}`,
      gpa: semester.gpa,
      year: semester.year,
      semesterNumber: semester.semester
    }));
    
    sendResponse(res, true, 'GPA trend retrieved successfully', gpaTrend);
  });
});

// Get course analysis
router.get('/course-analysis', authenticateToken, (req, res) => {
  db.all('SELECT c.name, c.credits, c.grade, c.points FROM courses c JOIN semesters s ON c.semester_id = s.id WHERE s.user_id = ?', [req.user.userId], (err, data) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    const courses = (data || []).map(course => ({
      name: course.name,
      credits: course.credits,
      grade: course.grade,
      points: course.points,
      performance: (course.points / 4.0) * 100 // Convert to percentage
    }));
    
    sendResponse(res, true, 'Course analysis retrieved successfully', courses);
  });
});

// Get grade distribution
router.get('/grade-distribution', authenticateToken, (req, res) => {
  db.all('SELECT c.grade, COUNT(*) as count FROM courses c JOIN semesters s ON c.semester_id = s.id WHERE s.user_id = ? GROUP BY c.grade', [req.user.userId], (err, data) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    const gradeDistribution = (data || []).map(grade => ({
      grade: grade.grade,
      count: grade.count
    }));
    
    sendResponse(res, true, 'Grade distribution retrieved successfully', gradeDistribution);
  });
});

// Get deadline clustering analysis
router.get('/deadline-clustering', authenticateToken, (req, res) => {
  db.all('SELECT date, type, title FROM planner_events WHERE user_id = ? AND type IN ("deadline", "assignment", "exam") ORDER BY date', [req.user.userId], (err, data) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    const events = (data || []).map(event => ({
      date: event.date,
      type: event.type,
      title: event.title
    }));
    
    // Analyze deadline clustering
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const upcomingDeadlines = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= nextMonth;
    });
    
    const weeklyDeadlines = upcomingDeadlines.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate <= nextWeek;
    });
    
    const clusteringAlert = weeklyDeadlines.length > 3 ? {
      alert: true,
      message: `High concentration of ${weeklyDeadlines.length} deadlines this week`,
      deadlines: weeklyDeadlines
    } : {
      alert: false,
      message: 'Deadlines are well distributed',
      deadlines: weeklyDeadlines
    };
    
    sendResponse(res, true, 'Deadline clustering analysis completed', {
      upcomingDeadlines: upcomingDeadlines.length,
      weeklyDeadlines: weeklyDeadlines.length,
      clusteringAlert
    });
  });
});

// Get workload distribution
router.get('/workload-distribution', authenticateToken, (req, res) => {
  db.all('SELECT c.credits, s.year, s.semester FROM courses c JOIN semesters s ON c.semester_id = s.id WHERE s.user_id = ?', [req.user.userId], (err, data) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    const workloadData = (data || []).reduce((acc, course) => {
      const key = `Year ${course.year} - Sem ${course.semester}`;
      if (!acc[key]) {
        acc[key] = { semester: key, credits: 0, courses: 0 };
      }
      acc[key].credits += course.credits;
      acc[key].courses += 1;
      return acc;
    }, {});
    
    const workloadDistribution = Object.values(workloadData);
    
    sendResponse(res, true, 'Workload distribution retrieved successfully', workloadDistribution);
  });
});

module.exports = router;
