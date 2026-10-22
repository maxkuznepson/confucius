// ============================================================================
// Типы данных API
// ============================================================================

export type UserRole = 'student' | 'parent' | 'teacher' | 'school_admin' | 'super_admin';
export type Language = 'ru' | 'zh' | 'en';

// ---------- Пользователи ----------
export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  preferred_lang: Language;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

// ---------- Профили ----------
export interface Student {
  id: string;
  user_id: string;
  class_id: string;
  student_no: string;
  birth_date: string | null;
  gender: string | null;
  enrollment_date: string | null;
  status: string;
}

export interface Parent {
  id: string;
  user_id: string;
  occupation: string | null;
}

export interface Teacher {
  id: string;
  user_id: string;
  employee_no: string;
  specialization: string;
  status: string;
}

// ---------- Курсы ----------
export interface Course {
  id: string;
  code: string;
  title: string;
  title_zh: string | null;
  description: string | null;
  course_type: 'live' | 'recorded' | 'offline';
  subject: string;
  is_free: boolean;
  price: number;
  is_additional: boolean;
  status: string;
}

export interface CourseLesson {
  id: string;
  course_id: string;
  class_id: string;  // Привязка к классу
  title: string;
  title_zh: string | null;
  lesson_order: number;
  scheduled_at: string;
  duration_min: number;
  room: string | null;
  live_status: 'upcoming' | 'live' | 'finished';
}

// ---------- ДЗ ----------
export interface Homework {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  hw_type: string | null;
  max_score: number | null;
  published_at: string;
  deadline_at: string;
  allow_late: boolean;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue' | 'resubmitted';
  submitted_at: string | null;
  score: number | null;
  correctness: number | null;
  time_spent_min: number | null;
}

// ---------- Оценки ----------
export interface Grade {
  id: number;
  student_id: string;
  subject: string;
  grade_type: string;
  period_label: string;
  score: number;
  max_score: number;
  graded_at: string;
}

export interface LessonRating {
  id: number;
  lesson_id: string;
  student_id: string;
  stars: number;
  comment: string | null;
  rated_at: string;
}

// ---------- Посещаемость ----------
export interface Attendance {
  id: number;
  student_id: string;
  lesson_id: string | null;
  status: 'present' | 'late' | 'absent' | 'excused';
  marked_at: string;
}

// ---------- Достижения ----------
export interface Achievement {
  id: string;
  student_id: string;
  category: 'class' | 'school' | 'external';
  title: string | null;
  title_zh: string | null;
  description: string | null;
  issuer: string | null;
  issued_date: string | null;
}

// ---------- Конкурсы и мероприятия ----------
export interface Contest {
  id: string;
  title: string;
  title_zh: string | null;
  description: string | null;
  rules: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_deadline: string | null;
  status: 'open' | 'closed' | 'cancelled' | 'completed';
}

export interface Event {
  id: string;
  title: string;
  title_zh: string | null;
  description: string | null;
  event_type: string | null;
  start_at: string | null;
  end_at: string | null;
  location: string | null;
  is_paid: boolean;
  price: number;
  status: 'open' | 'closed' | 'cancelled' | 'completed';
}

// ---------- Уведомления ----------
export interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string | null;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

// ---------- Баллы ----------
export interface PointsAccount {
  user_id: string;
  balance: number;
  total_earned: number;
}

export interface PointsTransaction {
  id: number;
  user_id: string;
  source: string;
  amount: number;
  description: string | null;
  created_at: string;
}

// ---------- Auth ----------
export interface LoginRequest {
  identifier: string; // email, phone или username
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  role: UserRole;
  profile: Student | Parent | Teacher;
}

export interface RegisterRequest {
  phone: string;
  email: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  referrerPhone?: string;
  referrerEmail?: string;
  password: string;
}

// ---------- API Response ----------
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
