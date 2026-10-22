/**
 * Mock API Service
 * 
 * Реализация IApiService на основе локальных MOCK-данных.
 * Используется когда USE_MOCK = true.
 */

import type { IApiService, LoginResponse, RegisterData } from './api.types';
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
import {
  mockUsers,
  mockStudents,
  mockParents,
  mockTeachers,
  mockCourses,
  mockLessons,
  mockHomeworks,
  mockSubmissions,
  mockGrades,
  mockLessonRatings,
  mockAttendance,
  mockAchievements,
  mockContests,
  mockEvents,
  mockNotifications,
  mockPointsAccounts,
  mockPointsTransactions,
  mockParentStudents,
  mockTeacherStudents,
  authenticateUser,
} from '../data/mock';

// Имитация задержки сети
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiService implements IApiService {
  private currentUser: User | null = null;

  // ---------- Authentication ----------

  async login(identifier: string, password: string): Promise<LoginResponse | null> {
    await delay(200);
    
    const user = authenticateUser(identifier, password);
    if (!user) return null;

    this.currentUser = user;

    let profile: Student | Parent | Teacher;
    if (user.role === 'student') {
      profile = mockStudents.find(s => s.user_id === user.id)!;
    } else if (user.role === 'parent') {
      profile = mockParents.find(p => p.user_id === user.id)!;
    } else {
      profile = mockTeachers.find(t => t.user_id === user.id)!;
    }

    return {
      user,
      token: `mock-token-${user.id}`,
      role: user.role as 'student' | 'parent' | 'teacher',
      profile,
    };
  }

  async register(data: RegisterData): Promise<boolean> {
    await delay(500);
    // В MOCK режиме просто возвращаем успех
    console.log('[MockAPI] Register:', data);
    return true;
  }

  async logout(): Promise<void> {
    await delay(100);
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  // ---------- Students ----------

  async getStudentByUserId(userId: string): Promise<Student | null> {
    await delay();
    return mockStudents.find(s => s.user_id === userId) || null;
  }

  async getStudentCourses(studentId: string): Promise<Course[]> {
    await delay();
    // Возвращаем курсы, на которые записан ученик
    // В MOCK пока возвращаем все основные курсы
    return mockCourses.filter(c => !c.is_additional);
  }

  async getStudentLessons(studentId: string): Promise<CourseLesson[]> {
    await delay();
    return mockLessons;
  }

  async getStudentHomeworks(studentId: string): Promise<Homework[]> {
    await delay();
    return mockHomeworks;
  }

  async getStudentSubmissions(studentId: string): Promise<HomeworkSubmission[]> {
    await delay();
    return mockSubmissions.filter(s => s.student_id === studentId);
  }

  async getStudentGrades(studentId: string): Promise<Grade[]> {
    await delay();
    return mockGrades.filter(g => g.student_id === studentId);
  }

  async getStudentRatings(studentId: string): Promise<LessonRating[]> {
    await delay();
    return mockLessonRatings.filter(r => r.student_id === studentId);
  }

  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    await delay();
    return mockAttendance.filter(a => a.student_id === studentId);
  }

  async getStudentAchievements(studentId: string): Promise<Achievement[]> {
    await delay();
    return mockAchievements.filter(a => a.student_id === studentId);
  }

  // ---------- Parents ----------

  async getParentByUserId(userId: string): Promise<Parent | null> {
    await delay();
    return mockParents.find(p => p.user_id === userId) || null;
  }

  async getChildrenOfParent(parentId: string): Promise<Student[]> {
    await delay();
    const links = mockParentStudents.filter(ps => ps.parent_id === parentId);
    return links
      .map(l => mockStudents.find(s => s.id === l.student_id)!)
      .filter(Boolean);
  }

  async getChildGrades(studentId: string): Promise<Grade[]> {
    return this.getStudentGrades(studentId);
  }

  async getChildAttendance(studentId: string): Promise<Attendance[]> {
    return this.getStudentAttendance(studentId);
  }

  // ---------- Teachers ----------

  async getTeacherByUserId(userId: string): Promise<Teacher | null> {
    await delay();
    return mockTeachers.find(t => t.user_id === userId) || null;
  }

  async getTeacherStudents(teacherId: string): Promise<Student[]> {
    await delay();
    const studentIds = mockTeacherStudents
      .filter(ts => ts.teacher_id === teacherId)
      .map(ts => ts.student_id);
    return mockStudents.filter(s => studentIds.includes(s.id));
  }

  async getTeacherSchedule(teacherId: string, year?: number): Promise<CourseLesson[]> {
    await delay();
    const targetYear = year || new Date().getFullYear();
    
    // Получаем классы учителя через учеников
    const studentIds = mockTeacherStudents
      .filter(ts => ts.teacher_id === teacherId)
      .map(ts => ts.student_id);
    
    const classIds = new Set<string>();
    studentIds.forEach(studentId => {
      const student = mockStudents.find(s => s.id === studentId);
      if (student?.class_id) {
        classIds.add(student.class_id);
      }
    });
    
    // Фильтруем уроки по классам учителя и году
    return mockLessons.filter(lesson => {
      if (!classIds.has(lesson.class_id)) return false;
      const lessonDate = new Date(lesson.scheduled_at);
      return lessonDate.getFullYear() === targetYear;
    }).sort((a, b) => 
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  }

  // ---------- Contests & Events ----------

  async getContests(): Promise<Contest[]> {
    await delay();
    return mockContests;
  }

  async getEvents(): Promise<Event[]> {
    await delay();
    return mockEvents;
  }

  // ---------- Notifications ----------

  async getNotifications(userId: string): Promise<Notification[]> {
    await delay();
    return mockNotifications.filter(n => n.user_id === userId);
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await delay(100);
    const notif = mockNotifications.find(n => n.id === notificationId);
    if (notif) notif.is_read = true;
  }

  // ---------- Points ----------

  async getPointsAccount(userId: string): Promise<PointsAccount | null> {
    await delay();
    return mockPointsAccounts.find(p => p.user_id === userId) || null;
  }

  async getPointsTransactions(userId: string): Promise<PointsTransaction[]> {
    await delay();
    return mockPointsTransactions.filter(t => t.user_id === userId);
  }

  // ---------- Homework Submissions ----------

  async submitHomework(submissionId: string, data: any): Promise<boolean> {
    await delay(500);
    console.log('[MockAPI] Submit homework:', submissionId, data);
    return true;
  }
}
