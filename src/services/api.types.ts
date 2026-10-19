/**
 * API Service Interface
 * 
 * Этот интерфейс определяет все методы для работы с данными приложения.
 * Реализации:
 *   - MockApiService — работа с локальными MOCK-данными
 *   - SupabaseApiService — работа с Supabase (PostgreSQL)
 *   - RestApiService — работа с REST API (будущее)
 */

import type {
  User,
  Student,
  Parent,
  Teacher,
  Course,
  CourseLesson,
  Homework,
  HomeworkSubmission,
  Grade,
  LessonRating,
  Attendance,
  Achievement,
  Contest,
  Event,
  Notification,
  PointsAccount,
  PointsTransaction,
} from '../data/mock';

// ============================================================================
// Authentication
// ============================================================================

export interface LoginResponse {
  user: User;
  token: string;
  role: 'student' | 'parent' | 'teacher';
  profile: Student | Parent | Teacher;
}

export interface RegisterData {
  phone: string;
  email: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  referrerPhone?: string;
  referrerEmail?: string;
  password: string;
}

// ============================================================================
// API Service Interface
// ============================================================================

export interface IApiService {
  // ---------- Authentication ----------
  login(identifier: string, password: string): Promise<LoginResponse | null>;
  register(data: RegisterData): Promise<boolean>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;

  // ---------- Students ----------
  getStudentByUserId(userId: string): Promise<Student | null>;
  getStudentCourses(studentId: string): Promise<Course[]>;
  getStudentLessons(studentId: string): Promise<CourseLesson[]>;
  getStudentHomeworks(studentId: string): Promise<Homework[]>;
  getStudentSubmissions(studentId: string): Promise<HomeworkSubmission[]>;
  getStudentGrades(studentId: string): Promise<Grade[]>;
  getStudentRatings(studentId: string): Promise<LessonRating[]>;
  getStudentAttendance(studentId: string): Promise<Attendance[]>;
  getStudentAchievements(studentId: string): Promise<Achievement[]>;

  // ---------- Parents ----------
  getParentByUserId(userId: string): Promise<Parent | null>;
  getChildrenOfParent(parentId: string): Promise<Student[]>;
  getChildGrades(studentId: string): Promise<Grade[]>;
  getChildAttendance(studentId: string): Promise<Attendance[]>;

  // ---------- Teachers ----------
  getTeacherByUserId(userId: string): Promise<Teacher | null>;
  getTeacherStudents(teacherId: string): Promise<Student[]>;

  // ---------- Contests & Events ----------
  getContests(): Promise<Contest[]>;
  getEvents(): Promise<Event[]>;

  // ---------- Notifications ----------
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;

  // ---------- Points ----------
  getPointsAccount(userId: string): Promise<PointsAccount | null>;
  getPointsTransactions(userId: string): Promise<PointsTransaction[]>;

  // ---------- Homework Submissions ----------
  submitHomework(submissionId: string, data: any): Promise<boolean>;
}

// ============================================================================
// Error Types
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthError extends ApiError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, code, 401);
    this.name = 'AuthError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}
