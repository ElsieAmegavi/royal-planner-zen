# Royal Planner
# Elsie Loise Amegavi - 11348827

A comprehensive academic planning and management application designed to help students track their academic progress, manage their schedules, and achieve their educational goals.

## Project Overview

Royal Planner is a modern web application built for students who want to take control of their academic journey. The application provides powerful tools for GPA calculation, semester planning, journaling, and academic analytics.

## Features

- **GPA Calculator**: Track semester and cumulative GPA with detailed course management
- **Academic Planner**: Organize classes, assignments, and study sessions
- **Reflection Journal**: Document your academic journey and personal growth
- **Target Grade Estimator**: Set and track progress toward academic goals
- **Grade Analytics**: Visualize academic performance with charts and insights
- **Workload Balancer**: Manage study time and assignment deadlines
- **Notifications**: Stay on top of important academic deadlines
- **User Profile**: Manage personal information and academic settings

## Technologies Used

This project is built with modern web technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF
- **CSV Processing**: PapaParse
- **Routing**: React Router DOM

##  Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd royal-planner-zen
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
npm run backend:install
```

### Running the Application

#### Option 1: Run Both Frontend and Backend Together
```bash
npm run start:full
```

#### Option 2: Run Separately
1. Start the backend server:
```bash
npm run backend
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Backend API

The backend server runs on `http://localhost:3001` and provides RESTful APIs for:
- User authentication and management
- Academic data (semesters, courses, GPA)
- Planner events and calendar
- Journal entries and mood tracking
- Target grades and analytics
- Notifications and settings

### Default Login Credentials

- **Email**: `student@royal.edu` | **Password**: `password123`
- **Email**: `demo@test.com` | **Password**: `demo123`

##  Responsive Design

The application is fully responsive and optimized for:
- Mobile devices (320px and up)
- Tablets (768px and up)
- Desktop computers (1024px and up)

##  Design System

Royal Planner Zen features a cohesive design system with:
- **Primary Color**: Royal Purple (#8B5CF6)
- **Accent Color**: Gold (#FCD34D)
- **Typography**: Clean, readable fonts optimized for academic content
- **Components**: Consistent UI patterns throughout the application

##  Academic Use

This application is designed for:
- University students
- College students
- High school students
- Anyone pursuing academic goals

##  Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages/routes
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Static assets
```

##  License

This project is created for academic purposes as part of a Human Computer Interaction course.

## Author

Elsie Loise Amegavi - 11348827
Developed as a semester project for DCIT 302 - Human Computer Interaction.
