# Royal Planner Backend API

Backend API server for the Royal Planner academic management application.

## Features

- **User Authentication**: Registration, login, and JWT-based authentication
- **Academic Data Management**: Semesters, courses, and GPA calculations
- **Planner Events**: Academic calendar and event management
- **Journal Entries**: Student reflection and mood tracking
- **Target Grades**: Goal setting and progress tracking
- **Notifications**: Academic alerts and reminders
- **Analytics**: GPA history and performance insights

## Technologies Used

- **Express.js**: Web framework
- **SQLite**: Lightweight database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Semesters & Courses
- `GET /api/semesters` - Get all semesters
- `POST /api/semesters` - Create new semester
- `GET /api/semesters/:id/courses` - Get courses for semester
- `POST /api/semesters/:id/courses` - Add course to semester
- `DELETE /api/courses/:id` - Delete course

### Grade Settings
- `GET /api/grade-settings` - Get grade point settings
- `PUT /api/grade-settings` - Update grade point settings

### Planner Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Journal Entries
- `GET /api/journal` - Get all journal entries
- `POST /api/journal` - Create new journal entry
- `PUT /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry

### Target Grades
- `GET /api/target-grades` - Get target grade settings
- `POST /api/target-grades` - Set target grade

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### Notification Settings
- `GET /api/notification-settings` - Get notification preferences
- `PUT /api/notification-settings` - Update notification preferences

### Analytics
- `GET /api/analytics/gpa-history` - Get GPA history
- `GET /api/analytics/cumulative-gpa` - Get cumulative GPA

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts
- `user_profiles` - User profile information
- `semesters` - Academic semesters
- `courses` - Course records
- `grade_settings` - Grade point mappings
- `planner_events` - Calendar events
- `journal_entries` - Student journal entries
- `target_grades` - Academic goals
- `notifications` - System notifications
- `notification_settings` - User notification preferences

## Default Users

The system comes with two default users for testing:
- Email: `student@royal.edu`, Password: `password123`
- Email: `demo@test.com`, Password: `demo123`

## Author

Developed by Elsie Loise Amegavi (11348827) as part of DCIT 302 - Human Computer Interaction course.
