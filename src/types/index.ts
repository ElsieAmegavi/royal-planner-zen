/* eslint-disable @typescript-eslint/no-explicit-any */
// Centralized Type Definitions for Royal Planner

// ===== AUTHENTICATION TYPES =====
export type AuthMode = "login" | "register" | "forgot-password";

export interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

// ===== ACADEMIC TYPES =====
export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  points: number;
}

export interface SemesterData {
  id: string;
  year: number;
  semester: number;
  courses: Course[];
  gpa: number;
}

export interface TargetData {
  id?: number;
  targetGpa: number;
  targetSemester: string;
  currentCredits: number;
  currentGpa: number;
  createdAt?: string;
}

// ===== JOURNAL TYPES =====
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: "motivated" | "stressed" | "happy" | "anxious" | "confident" | "overwhelmed" | "focused" | "tired";
  tags: string[];
  date: Date;
}

export interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export interface JournalFormDialogProps {
  entry?: JournalEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<JournalEntry, 'id'> | JournalEntry) => void;
}

// ===== NOTIFICATION TYPES =====
export interface Notification {
  id: string;
  type: 'assignment' | 'deadline' | 'gpa' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent?: boolean;
}

// ===== PLANNER TYPES =====
export interface PlannerEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: "class" | "assignment" | "deadline" | "quiz" | "exam" | "study";
  time?: string;
  priority?: "low" | "medium" | "high";
  reminders?: string[];
  isRecurring?: boolean;
  recurringDays?: number[]; // 0-6 for Sunday-Saturday
  courseCode?: string;
  location?: string;
}

// ===== TIMETABLE TYPES =====
export interface TimetableEntry {
  courseName: string;
  courseCode: string;
  instructor: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  semester: string;
  year: string;
}

export interface TimetableDialogProps {
  onAddTimetable: (timetable: PlannerEvent) => void;
}

export interface BulkTimetableUploadProps {
  onUpload: (entries: TimetableEntry[]) => void;
}

// ===== LAYOUT TYPES =====
export interface LayoutProps {
  children: React.ReactNode;
}

// ===== THEME TYPES =====
export type Theme = "dark" | "light" | "system";

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data: T;
}

// ===== USER PROFILE TYPES =====
export interface UserProfile {
  id?: number;
  user_id?: number;
  name: string;
  email: string;
  academic_level?: string;
  academic_years?: number;
}

// ===== GRADE SETTINGS TYPES =====
export interface GradeSettings {
  [key: string]: number;
}

// ===== NOTIFICATION SETTINGS TYPES =====
export interface NotificationSettings {
  id?: number;
  user_id?: number;
  assignments: boolean;
  deadlines: boolean;
  gpa_updates: boolean;
  weekly_reports: boolean;
  assignment_frequency: string;
  deadline_timings: string;
}

// ===== ANALYTICS TYPES =====
export interface AnalyticsData {
  cumulativeGpa: number;
  totalCredits: number;
  totalCourses: number;
}

export interface GpaHistoryEntry {
  year: number;
  semester: number;
  gpa: number;
}

export interface GpaTrendEntry {
  semester: string;
  gpa: number;
  year: number;
  semesterNumber: number;
}

export interface CourseAnalysisEntry {
  name: string;
  credits: number;
  grade: string;
  points: number;
  performance: number;
}

export interface GradeDistributionEntry {
  grade: string;
  count: number;
}

export interface DeadlineClusteringData {
  upcomingDeadlines: number;
  weeklyDeadlines: number;
  clusteringAlert: {
    alert: boolean;
    message: string;
    deadlines: Array<{
      date: string;
      type: string;
      title: string;
    }>;
  };
}

export interface WorkloadDistributionEntry {
  semester: string;
  credits: number;
  courses: number;
}

// ===== DASHBOARD TYPES =====
export interface DashboardData {
  currentGpa: number;
  targetGpa: number;
  totalCredits: number;
  upcomingEvents: number;
  isLoading: boolean;
}
