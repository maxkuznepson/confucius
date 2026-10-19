/**
 * REST API Service
 * 
 * Реализация IApiService на основе REST API (Node.js + Fastify).
 * Используется когда USE_MOCK = false.
 */

import type { IApiService, LoginResponse, RegisterData } from './api.types';
import { ApiError, AuthError, NetworkError } from './api.types';
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
import { API_CONFIG } from '../config';

// Хранилище токена
let authToken: string | null = null;

// Установка токена
export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('confucius_auth_token', token);
  } else {
    localStorage.removeItem('confucius_auth_token');
  }
}

// Получение токена
export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('confucius_auth_token');
  }
  return authToken;
}

// Базовая функция для запросов
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new AuthError(errorData.error || 'Unauthorized');
      }
      
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        'API_ERROR',
        response.status,
        errorData
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new ApiError(data.error || 'Unknown error', 'API_ERROR');
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network error: unable to connect to API');
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      'UNKNOWN_ERROR'
    );
  }
}

export class RestApiService implements IApiService {
  // ---------- Authentication ----------

  async login(identifier: string, password: string): Promise<LoginResponse | null> {
    try {
      const response = await apiRequest<{
        user: User;
        token: string;
        role: 'student' | 'parent' | 'teacher';
        profile: Student | Parent | Teacher;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      // Сохраняем токен
      setAuthToken(response.token);

      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        return null;
      }
      throw error;
    }
  }

  async register(data: RegisterData): Promise<boolean> {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return true;
  }

  async logout(): Promise<void> {
    setAuthToken(null);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await apiRequest<User>('/auth/me');
    } catch (error) {
      if (error instanceof AuthError) {
        return null;
      }
      throw error;
    }
  }

  // ---------- Students ----------

  async getStudentByUserId(userId: string): Promise<Student | null> {
    try {
      return await apiRequest<Student>('/students/me');
    } catch (error) {
      return null;
    }
  }

  async getStudentCourses(studentId: string): Promise<Course[]> {
    return await apiRequest<Course[]>('/students/me/courses');
  }

  async getStudentLessons(studentId: string): Promise<CourseLesson[]> {
    return await apiRequest<CourseLesson[]>('/students/me/lessons');
  }

  async getStudentHomeworks(studentId: string): Promise<Homework[]> {
    return await apiRequest<Homework[]>('/students/me/homeworks');
  }

  async getStudentSubmissions(studentId: string): Promise<HomeworkSubmission[]> {
    return await apiRequest<HomeworkSubmission[]>('/students/me/submissions');
  }

  async getStudentGrades(studentId: string): Promise<Grade[]> {
    return await apiRequest<Grade[]>('/students/me/grades');
  }

  async getStudentRatings(studentId: string): Promise<LessonRating[]> {
    return await apiRequest<LessonRating[]>('/students/me/ratings');
  }

  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    return await apiRequest<Attendance[]>('/students/me/attendance');
  }

  async getStudentAchievements(studentId: string): Promise<Achievement[]> {
    return await apiRequest<Achievement[]>('/students/me/achievements');
  }

  // ---------- Parents ----------

  async getParentByUserId(userId: string): Promise<Parent | null> {
    try {
      return await apiRequest<Parent>('/parents/me');
    } catch (error) {
      return null;
    }
  }

  async getChildrenOfParent(parentId: string): Promise<Student[]> {
    return await apiRequest<(Student & { full_name: string })[]>('/parents/me/children');
  }

  async getChildGrades(studentId: string): Promise<Grade[]> {
    return await apiRequest<Grade[]>(`/parents/children/${studentId}/grades`);
  }

  async getChildAttendance(studentId: string): Promise<Attendance[]> {
    return await apiRequest<Attendance[]>(`/parents/children/${studentId}/attendance`);
  }

  // ---------- Teachers ----------

  async getTeacherByUserId(userId: string): Promise<Teacher | null> {
    try {
      return await apiRequest<Teacher>('/teachers/me');
    } catch (error) {
      return null;
    }
  }

  async getTeacherStudents(teacherId: string): Promise<Student[]> {
    return await apiRequest<(Student & { full_name: string })[]>('/teachers/me/students');
  }

  // ---------- Contests & Events ----------

  async getContests(): Promise<Contest[]> {
    return await apiRequest<Contest[]>('/contests');
  }

  async getEvents(): Promise<Event[]> {
    return await apiRequest<Event[]>('/events');
  }

  // ---------- Notifications ----------

  async getNotifications(userId: string): Promise<Notification[]> {
    return await apiRequest<Notification[]>('/notifications');
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await apiRequest(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  // ---------- Points ----------

  async getPointsAccount(userId: string): Promise<PointsAccount | null> {
    try {
      return await apiRequest<PointsAccount>('/points');
    } catch (error) {
      return null;
    }
  }

  async getPointsTransactions(userId: string): Promise<PointsTransaction[]> {
    return await apiRequest<PointsTransaction[]>('/points/transactions');
  }

  // ---------- Homework Submissions ----------

  async submitHomework(submissionId: string, data: any): Promise<boolean> {
    await apiRequest(`/homeworks/submissions/${submissionId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return true;
  }
}
