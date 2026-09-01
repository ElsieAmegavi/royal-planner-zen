# Royal Planner
# Elsie Loise Amegavi - 11348827

A comprehensive academic planning and management application designed to help students track their academic progress, manage their schedules, and achieve their educational goals.

## Project Overview

Royal Planner is a modern web application built for students who want to take control of their academic journey. The application provides powerful tools for GPA calculation, semester planning, journaling, and academic analytics.

## Current Status & Deployment

**Full task tracker — what's done, what's pending, what needs a decision —
lives in `royal_planner_flutter/PROJECT_STATUS.md` (sibling folder). Read
that file before picking up any work here or in the Flutter app.**

Quick facts about this specific repo:
- Backend is live on Render (free tier): `https://royal-planner-zen.onrender.com`
  — `GET /api/health` should return `{"status":"ok"}`.
- Database is Postgres (migrated from SQLite — see `backend/database/connection.js`),
  also on Render's free tier. **That free Postgres instance expires 2026-10-01**
  unless upgraded before then — check `PROJECT_STATUS.md` for what that means.
- `backend/royal_planner.db` (old SQLite file) is no longer used by anything.

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

## Flutter Mobile App (Android)
This repository also includes a Flutter mobile replica of the Royal Planner web app in `royal_planner_flutter/`.

### Option 1 (recommended): run the emulator + app with a script
1. Open PowerShell from the `royal-planner-zen` folder.
2. Run:
   ```powershell
   cd "c:\Users\DELL\Documents\School\DCIT 302 - HUMAN COMPUTER INTERACTION\SEMESTER PROJECT\royal-planner-zen"
   ..\royal_planner_flutter\scripts\run_emulator_and_app.ps1 -AvdId Pixel_8
   ```

What it does:
1. Launches the Android emulator AVD (`Pixel_8`)
2. Waits until Android fully boots (`sys.boot_completed == 1`)
3. Runs the Flutter app on the emulator

### Option 2: manual emulator steps
Run these commands in PowerShell:
1. Start the emulator:
   ```powershell
   cd "c:\Users\DELL\Documents\School\DCIT 302 - HUMAN COMPUTER INTERACTION\SEMESTER PROJECT\royal_planner_flutter"
   & "C:\flutter\bin\flutter.bat" emulators --launch Pixel_8
   ```
2. Confirm the emulator appears in Flutter devices:
   ```powershell
   & "C:\flutter\bin\flutter.bat" devices
   ```
3. Wait for Android boot completion (ADB loop):
   ```powershell
   $sdkRoot = "$env:ANDROID_SDK_ROOT"
   if (-not $sdkRoot) { $sdkRoot = "$env:ANDROID_HOME" }
   if (-not $sdkRoot) { $sdkRoot = "$env:LOCALAPPDATA\Android\sdk" }
   $adb = Join-Path $sdkRoot "platform-tools\adb.exe"

   # Use the emulator serial shown by: adb devices
   $serial = "emulator-5554"

   & $adb -s $serial wait-for-device
   while ((& $adb -s $serial shell getprop sys.boot_completed).Trim() -ne "1") {
     Write-Host "Waiting for Android boot..."
     Start-Sleep -Seconds 2
   }
   ```
4. Run the app on the emulator:
   ```powershell
   & "C:\flutter\bin\flutter.bat" run -d emulator-5554
   ```

### Running on a real Android phone (USB) - step-by-step
1. Enable Developer Options on the phone:
   - Settings -> About phone
   - Tap `Build number` 7 times (or until you see “You are now a developer”)
2. Enable USB debugging:
   - Settings -> Developer options -> enable `USB debugging`
3. Connect the phone to your laptop using a USB cable.
4. On the phone, accept the prompt for USB debugging (or choose “Allow” for this computer).
5. On Windows, ensure Android USB drivers are installed (if `adb devices` shows nothing). If needed, install the driver from your phone brand/OEM website.
6. Verify the device is detected:
   ```powershell
   # adb must be installed with Android platform-tools
   $sdkRoot = "$env:ANDROID_SDK_ROOT"
   if (-not $sdkRoot) { $sdkRoot = "$env:ANDROID_HOME" }
   if (-not $sdkRoot) { $sdkRoot = "$env:LOCALAPPDATA\Android\sdk" }
   $adb = Join-Path $sdkRoot "platform-tools\adb.exe"

   & $adb devices
   ```
   You should see a line like `R58J...  device` (that ID is your `deviceId`).
   As a quick check, run:
   ```powershell
   & "C:\flutter\bin\flutter.bat" devices
   ```
7. Run the app on the phone:
   ```powershell
   cd "c:\Users\DELL\Documents\School\DCIT 302 - HUMAN COMPUTER INTERACTION\SEMESTER PROJECT\royal_planner_flutter"
   & "C:\flutter\bin\flutter.bat" run -d <deviceId>
   ```
   Example (your working device):
   ```powershell
   & "C:\flutter\bin\flutter.bat" run -d R83Y90DDRBT
   ```

If the phone is detected but `flutter run` fails:
1. Restart ADB:
   ```powershell
   $sdkRoot = "$env:ANDROID_SDK_ROOT"
   if (-not $sdkRoot) { $sdkRoot = "$env:ANDROID_HOME" }
   if (-not $sdkRoot) { $sdkRoot = "$env:LOCALAPPDATA\Android\sdk" }
   $adb = Join-Path $sdkRoot "platform-tools\adb.exe"

   & $adb kill-server
   & $adb start-server
   ```
2. Unplug/replug the USB cable and confirm the “Allow USB debugging” prompt again.

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
