const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
// require('dotenv').config();

const app = express();
const PORT = 3001;//process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Frontend URL
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize SQLite Database
const db = new sqlite3.Database('./royal_planner.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    academic_level TEXT,
    academic_years INTEGER DEFAULT 4,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table created/verified');
    }
  });

  // User profiles table
  db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    academic_level TEXT,
    academic_years INTEGER DEFAULT 4,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Semesters table
  db.run(`CREATE TABLE IF NOT EXISTS semesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    gpa REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Courses table
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    credits REAL NOT NULL,
    grade TEXT NOT NULL,
    points REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (semester_id) REFERENCES semesters (id)
  )`);

  // Grade settings table
  db.run(`CREATE TABLE IF NOT EXISTS grade_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    grade TEXT NOT NULL,
    points REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Planner events table
  db.run(`CREATE TABLE IF NOT EXISTS planner_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    time TEXT,
    priority TEXT DEFAULT 'medium',
    reminders TEXT,
    is_recurring BOOLEAN DEFAULT 0,
    recurring_days TEXT,
    course_code TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Journal entries table
  db.run(`CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT NOT NULL,
    tags TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Target grades table
  db.run(`CREATE TABLE IF NOT EXISTS target_grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target_gpa REAL NOT NULL,
    target_semester TEXT NOT NULL,
    current_credits INTEGER DEFAULT 0,
    current_gpa REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Notifications table
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    urgent BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Notification settings table
  db.run(`CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    assignments BOOLEAN DEFAULT 1,
    deadlines BOOLEAN DEFAULT 1,
    gpa_updates BOOLEAN DEFAULT 1,
    weekly_reports BOOLEAN DEFAULT 0,
    assignment_frequency TEXT DEFAULT '24',
    deadline_timings TEXT DEFAULT '["2", "24"]',
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating notification_settings table:', err);
    } else {
      console.log('All tables created/verified');
      // Insert default users after all tables are created
      insertDefaultUsers();
    }
  });
}

// Insert default users
function insertDefaultUsers() {
  const defaultUsers = [
    { email: 'student@royal.edu', password: 'password123', name: 'Alex Johnson' },
    { email: 'demo@test.com', password: 'demo123', name: 'Demo User' }
  ];

  defaultUsers.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    db.run(`INSERT OR IGNORE INTO users (email, password, name) VALUES (?, ?, ?)`,
      [user.email, hashedPassword, user.name], (err) => {
        if (err) {
          console.error('Error inserting user:', err);
        } else {
          console.log(`Default user ${user.email} ready`);
        }
      });
  });

  console.log('Database initialized successfully');
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'royal-planner-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, academicLevel } = req.body;

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run('INSERT INTO users (email, password, name, academic_level) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, fullName, academicLevel], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Create user profile
          db.run('INSERT INTO user_profiles (user_id, name, email, academic_level) VALUES (?, ?, ?, ?)',
            [this.lastID, fullName, email, academicLevel]);

          // Create default grade settings
          const defaultGrades = [
            ['A+', 4.0], ['A', 4.0], ['A-', 3.7],
            ['B+', 3.3], ['B', 3.0], ['B-', 2.7],
            ['C+', 2.3], ['C', 2.0], ['C-', 1.7],
            ['D+', 1.3], ['D', 1.0], ['F', 0.0]
          ];

          defaultGrades.forEach(([grade, points]) => {
            db.run('INSERT INTO grade_settings (user_id, grade, points) VALUES (?, ?, ?)',
              [this.lastID, grade, points]);
          });

          // Create default notification settings
          db.run('INSERT INTO notification_settings (user_id) VALUES (?)', [this.lastID]);

          const token = jwt.sign({ userId: this.lastID, email }, process.env.JWT_SECRET || 'royal-planner-secret');
          res.json({ token, user: { id: this.lastID, email, name: fullName } });
        });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET || 'royal-planner-secret');
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// User Profile Routes
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.userId], (err, profile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(profile);
  });
});

app.put('/api/profile', authenticateToken, (req, res) => {
  const { name, email, academicLevel, academicYears } = req.body;
  
  db.run('UPDATE user_profiles SET name = ?, email = ?, academic_level = ?, academic_years = ? WHERE user_id = ?',
    [name, email, academicLevel, academicYears, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      res.json({ message: 'Profile updated successfully' });
    });
});

// Semester and Course Routes
app.get('/api/semesters', authenticateToken, (req, res) => {
  db.all('SELECT * FROM semesters WHERE user_id = ? ORDER BY year, semester', [req.user.userId], (err, semesters) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get courses for each semester
    const semestersWithCourses = semesters.map(semester => {
      return new Promise((resolve) => {
        db.all('SELECT * FROM courses WHERE semester_id = ? AND user_id = ?', [semester.id, req.user.userId], (err, courses) => {
          if (err) {
            resolve({ ...semester, courses: [] });
          } else {
            resolve({ ...semester, courses });
          }
        });
      });
    });
    
    Promise.all(semestersWithCourses).then(semestersData => {
      res.json(semestersData);
    });
  });
});

app.post('/api/semesters', authenticateToken, (req, res) => {
  const { year, semester } = req.body;
  
  db.run('INSERT INTO semesters (user_id, year, semester) VALUES (?, ?, ?)',
    [req.user.userId, year, semester], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create semester' });
      }
      res.json({ id: this.lastID, year, semester, gpa: 0 });
    });
});

app.get('/api/semesters/:id/courses', authenticateToken, (req, res) => {
  const semesterId = req.params.id;
  
  db.all('SELECT * FROM courses WHERE semester_id = ?', [semesterId], (err, courses) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(courses);
  });
});

app.post('/api/semesters/:id/courses', authenticateToken, (req, res) => {
  const semesterId = req.params.id;
  const { name, credits, grade, points } = req.body;
  
  db.run('INSERT INTO courses (user_id, semester_id, name, credits, grade, points) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.userId, semesterId, name, credits, grade, points], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add course' });
      }
      
      // Update semester GPA
      db.all('SELECT * FROM courses WHERE semester_id = ?', [semesterId], (err, courses) => {
        if (courses.length > 0) {
          const totalPoints = courses.reduce((sum, course) => sum + (course.points * course.credits), 0);
          const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
          const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
          
          db.run('UPDATE semesters SET gpa = ? WHERE id = ?', [gpa, semesterId]);
        }
      });
      
      res.json({ id: this.lastID, name, credits, grade, points });
    });
});

app.delete('/api/courses/:id', authenticateToken, (req, res) => {
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

// Grade Settings Routes
app.get('/api/grade-settings', authenticateToken, (req, res) => {
  db.all('SELECT grade, points FROM grade_settings WHERE user_id = ?', [req.user.userId], (err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const gradePoints = {};
    settings.forEach(setting => {
      gradePoints[setting.grade] = setting.points;
    });
    
    res.json(gradePoints);
  });
});

//Save grade settings
app.post('/api/grade-settings', authenticateToken, (req, res) => {
  const { grade, points } = req.body;
  
  db.run('INSERT INTO grade_settings (user_id, grade, points) VALUES (?, ?, ?)',
    [req.user.userId, grade, points], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save grade settings' });
      }
      res.json({ message: 'Grade settings saved successfully' });
    });
});

// Update individual grade setting
app.put('/api/grade-settings/update', authenticateToken, (req, res) => {
  const { grade, points } = req.body;
  
  db.run('UPDATE grade_settings SET points = ? WHERE user_id = ? AND grade = ?',
    [points, req.user.userId, grade], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update grade settings' });
      }
      res.json({ message: 'Grade settings updated successfully' });
    });
});

// Bulk update all grade settings
app.put('/api/grade-settings', authenticateToken, (req, res) => {
  const { gradeSettings } = req.body;
  
  // Delete all existing grade settings for this user
  db.run('DELETE FROM grade_settings WHERE user_id = ?', [req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear existing grade settings' });
    }
    
    // Insert new grade settings
    const stmt = db.prepare('INSERT INTO grade_settings (user_id, grade, points) VALUES (?, ?, ?)');
    let completed = 0;
    const total = Object.keys(gradeSettings).length;
    
    if (total === 0) {
      return res.json({ message: 'Grade settings updated successfully' });
    }
    
    Object.entries(gradeSettings).forEach(([grade, points]) => {
      stmt.run([req.user.userId, grade, points], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save grade settings' });
        }
        completed++;
        if (completed === total) {
          stmt.finalize();
          res.json({ message: 'Grade settings updated successfully' });
        }
      });
    });
  });
});

app.delete('/api/grade-settings', authenticateToken, (req, res) => {
  const { grade } = req.body;
  
  db.run('DELETE FROM grade_settings WHERE user_id = ? AND grade = ?',
    [req.user.userId, grade], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete grade settings' });
      }
      res.json({ message: 'Grade settings deleted successfully' });
    });
});

// Planner Events Routes
app.get('/api/events', authenticateToken, (req, res) => {
  db.all('SELECT * FROM planner_events WHERE user_id = ? ORDER BY date', [req.user.userId], (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(events);
  });
});

app.post('/api/events', authenticateToken, (req, res) => {
  const { title, description, date, type, time, priority, reminders, isRecurring, recurringDays, courseCode, location } = req.body;
  
  db.run('INSERT INTO planner_events (user_id, title, description, date, type, time, priority, reminders, is_recurring, recurring_days, course_code, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.userId, title, description, date, type, time, priority, JSON.stringify(reminders), isRecurring, JSON.stringify(recurringDays), courseCode, location], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create event' });
      }
      res.json({ id: this.lastID, title, description, date, type, time, priority, reminders, isRecurring, recurringDays, courseCode, location });
    });
});

app.put('/api/events/:id', authenticateToken, (req, res) => {
  const eventId = req.params.id;
  const { title, description, date, type, time, priority, reminders, isRecurring, recurringDays, courseCode, location } = req.body;
  
  db.run('UPDATE planner_events SET title = ?, description = ?, date = ?, type = ?, time = ?, priority = ?, reminders = ?, is_recurring = ?, recurring_days = ?, course_code = ?, location = ? WHERE id = ? AND user_id = ?',
    [title, description, date, type, time, priority, JSON.stringify(reminders), isRecurring, JSON.stringify(recurringDays), courseCode, location, eventId, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update event' });
      }
      res.json({ message: 'Event updated successfully' });
    });
});

app.delete('/api/events/:id', authenticateToken, (req, res) => {
  const eventId = req.params.id;
  
  db.run('DELETE FROM planner_events WHERE id = ? AND user_id = ?', [eventId, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete event' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
});

// Journal Entries Routes
app.get('/api/journal', authenticateToken, (req, res) => {
  db.all('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date DESC', [req.user.userId], (err, entries) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    // Parse tags from JSON string to array before sending response
    const entriesWithParsedTags = entries.map(entry => ({
      ...entry,
      tags: JSON.parse(entry.tags)
    }));
    res.json(entriesWithParsedTags);
  });
});

app.post('/api/journal', authenticateToken, (req, res) => {
  const { title, content, mood, tags, date } = req.body;
  
  db.run('INSERT INTO journal_entries (user_id, title, content, mood, tags, date) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.userId, title, content, mood, JSON.stringify(tags), date], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create journal entry' });
      }
      res.json({ id: this.lastID, title, content, mood, tags, date });
    });
});

app.put('/api/journal/:id', authenticateToken, (req, res) => {
  const entryId = req.params.id;
  const { title, content, mood, tags, date } = req.body;
  
  db.run('UPDATE journal_entries SET title = ?, content = ?, mood = ?, tags = ?, date = ? WHERE id = ? AND user_id = ?',
    [title, content, mood, JSON.stringify(tags), date, entryId, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update journal entry' });
      }
      res.json({ message: 'Journal entry updated successfully' });
    });
});

app.delete('/api/journal/:id', authenticateToken, (req, res) => {
  const entryId = req.params.id;
  
  db.run('DELETE FROM journal_entries WHERE id = ? AND user_id = ?', [entryId, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete journal entry' });
    }
    res.json({ message: 'Journal entry deleted successfully' });
  });
});

// Target Grades Routes
app.get('/api/target-grades', authenticateToken, (req, res) => {
  db.get('SELECT * FROM target_grades WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.user.userId], (err, target) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(target);
  });
});

app.post('/api/target-grades', authenticateToken, (req, res) => {
  const { targetGpa, targetSemester, currentCredits, currentGpa } = req.body;
  
  db.run('INSERT INTO target_grades (user_id, target_gpa, target_semester, current_credits, current_gpa) VALUES (?, ?, ?, ?, ?)',
    [req.user.userId, targetGpa, targetSemester, currentCredits, currentGpa], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create target grade' });
      }
      res.json({ id: this.lastID, targetGpa, targetSemester, currentCredits, currentGpa });
    });
});

// Notifications Routes
app.get('/api/notifications', authenticateToken, (req, res) => {
  db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId], (err, notifications) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(notifications);
  });
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notificationId = req.params.id;
  
  db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notificationId, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to mark notification as read' });
    }
    res.json({ message: 'Notification marked as read' });
  });
});

app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
    res.json({ message: 'All notifications marked as read' });
  });
});

// Notification Settings Routes
app.get('/api/notification-settings', authenticateToken, (req, res) => {
  db.get('SELECT * FROM notification_settings WHERE user_id = ?', [req.user.userId], (err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(settings);
  });
});

app.put('/api/notification-settings', authenticateToken, (req, res) => {
  const { assignments, deadlines, gpaUpdates, weeklyReports, assignmentFrequency, deadlineTimings } = req.body;
  
  db.run('UPDATE notification_settings SET assignments = ?, deadlines = ?, gpa_updates = ?, weekly_reports = ?, assignment_frequency = ?, deadline_timings = ? WHERE user_id = ?',
    [assignments, deadlines, gpaUpdates, weeklyReports, assignmentFrequency, JSON.stringify(deadlineTimings), req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update notification settings' });
      }
      res.json({ message: 'Notification settings updated successfully' });
    });
});

// Analytics Routes
app.get('/api/analytics/gpa-history', authenticateToken, (req, res) => {
  db.all('SELECT year, semester, gpa FROM semesters WHERE user_id = ? AND gpa > 0 ORDER BY year, semester', [req.user.userId], (err, history) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(history);
  });
});

app.get('/api/analytics/cumulative-gpa', authenticateToken, (req, res) => {
  db.all('SELECT s.*, c.* FROM semesters s LEFT JOIN courses c ON s.id = c.semester_id WHERE s.user_id = ?', [req.user.userId], (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const allCourses = data.filter(row => row.name).map(row => ({
      name: row.name,
      credits: row.credits,
      points: row.points
    }));
    
    const totalPoints = allCourses.reduce((sum, course) => sum + (course.points * course.credits), 0);
    const totalCredits = allCourses.reduce((sum, course) => sum + course.credits, 0);
    const cumulativeGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    
    res.json({ cumulativeGpa, totalCredits, totalCourses: allCourses.length });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Royal Planner Backend server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
