/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  const session = localStorage.getItem('userSession');
  if (session) {
    const userSession = JSON.parse(session);
    return userSession.token;
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format');
    }
    
    const text = await response.text();
    if (text.trim() === '') {
      throw new Error('Empty response received');
    }
    
    const data = JSON.parse(text);
    
    // Handle standardized API response format
    if (data.error) {
      throw new Error(data.message || 'API request failed');
    }
    
    // Return the data portion of the response
    return data.data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
    academicLevel: string;
  }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token and user data
    localStorage.setItem('userSession', JSON.stringify({
      token: response.token,
      email: response.user.email,
      name: response.user.name,
      isLoggedIn: true
    }));
    
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token and user data
    localStorage.setItem('userSession', JSON.stringify({
      token: response.token,
      email: response.user.email,
      name: response.user.name,
      isLoggedIn: true
    }));
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('userSession');
    localStorage.removeItem('userProfile');
  },

  isAuthenticated: () => {
    const session = localStorage.getItem('userSession');
    return session && JSON.parse(session).isLoggedIn;
  }
};

// User Profile API
export const profileAPI = {
  getProfile: () => apiRequest('/profile'),
  updateProfile: (profileData: any) => apiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => 
    apiRequest('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),
};

// Semesters and Courses API
export const semestersAPI = {
  getSemesters: () => apiRequest('/semesters'),
  createSemester: (semesterData: { year: number; semester: number }) => 
    apiRequest('/semesters', {
      method: 'POST',
      body: JSON.stringify(semesterData),
    }),
  cleanupDuplicates: () => apiRequest('/semesters/cleanup', {
    method: 'DELETE',
  }),
  getCourses: (semesterId: number) => apiRequest(`/semesters/${semesterId}/courses`),
  addCourse: (semesterId: number, courseData: {
    name: string;
    credits: number;
    grade: string;
    points: number;
  }) => apiRequest(`/semesters/${semesterId}/courses`, {
    method: 'POST',
    body: JSON.stringify(courseData),
  }),
  deleteCourse: (courseId: number) => apiRequest(`/courses/${courseId}`, {
    method: 'DELETE',
  }),
};

// Grade Settings API
export const gradeSettingsAPI = {
  getGradeSettings: () => apiRequest('/grade-settings'),
  updateGradeSettings: (gradeSettings: { [key: string]: number }) => 
    apiRequest('/grade-settings', {
      method: 'PUT',
      body: JSON.stringify({ gradeSettings }),
    }),
  addGradeSetting: (gradeData: { grade: string; points: number }) => 
    apiRequest('/grade-settings', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    }),
  updateGradeSetting: (gradeData: { grade: string; points: number }) => 
    apiRequest('/grade-settings/update', {
      method: 'PUT',
      body: JSON.stringify(gradeData),
    }),
  deleteGradeSetting: (grade: string) => apiRequest('/grade-settings', {
    method: 'DELETE',
    body: JSON.stringify({ grade }),
  }),
};

// Planner Events API
export const eventsAPI = {
  getEvents: () => apiRequest('/events'),
  createEvent: (eventData: {
    title: string;
    description: string;
    date: string;
    type: string;
    time?: string;
    priority?: string;
    reminders?: string[];
    isRecurring?: boolean;
    recurringDays?: number[];
    courseCode?: string;
    location?: string;
  }) => apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),
  updateEvent: (eventId: number, eventData: any) => 
    apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),
  deleteEvent: (eventId: number) => apiRequest(`/events/${eventId}`, {
    method: 'DELETE',
  }),
};

// Journal Entries API
export const journalAPI = {
  getEntries: () => apiRequest('/journal'),
  createEntry: (entryData: {
    title: string;
    content: string;
    mood: string;
    tags: string[];
    date: string;
  }) => apiRequest('/journal', {
    method: 'POST',
    body: JSON.stringify(entryData),
  }),
  updateEntry: (entryId: number, entryData: any) => 
    apiRequest(`/journal/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    }),
  deleteEntry: (entryId: number) => apiRequest(`/journal/${entryId}`, {
    method: 'DELETE',
  }),
};

// Target Grades API
export const targetGradesAPI = {
  getTargetGrade: () => apiRequest('/target-grades'),
  setTargetGrade: (targetData: {
    targetGpa: number;
    targetSemester: string;
    currentCredits: number;
    currentGpa: number;
  }) => apiRequest('/target-grades', {
    method: 'POST',
    body: JSON.stringify(targetData),
  }),
  deleteTargetGrade: () => apiRequest('/target-grades', {
    method: 'DELETE',
  }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => apiRequest('/notifications'),
  markAsRead: (notificationId: number) => 
    apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),
  markAllAsRead: () => 
    apiRequest('/notifications/read-all', {
      method: 'PUT',
    }),
};

// Notification Settings API
export const notificationSettingsAPI = {
  getNotificationSettings: () => apiRequest('/notification-settings'),
  updateNotificationSettings: (settings: {
    assignments: boolean;
    deadlines: boolean;
    gpaUpdates: boolean;
    weeklyReports: boolean;
    assignmentFrequency: string;
    deadlineTimings: string[];
  }) => apiRequest('/notification-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
};

// Analytics API
export const analyticsAPI = {
  getGpaHistory: () => apiRequest('/analytics/gpa-history'),
  getCumulativeGpa: () => apiRequest('/analytics/cumulative-gpa'),
  getGpaTrend: () => apiRequest('/analytics/gpa-trend'),
  getCourseAnalysis: () => apiRequest('/analytics/course-analysis'),
  getGradeDistribution: () => apiRequest('/analytics/grade-distribution'),
  getDeadlineClustering: () => apiRequest('/analytics/deadline-clustering'),
  getWorkloadDistribution: () => apiRequest('/analytics/workload-distribution'),
};

// Connection Test API
export const connectionAPI = {
  testConnection: async () => {
    try {
      await profileAPI.getProfile();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },
};
