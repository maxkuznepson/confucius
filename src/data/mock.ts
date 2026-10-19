// Mock data matching the database schema
// For running without a server

export interface User {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  full_name_zh: string;
  email: string;
  phone: string;
  role: 'student' | 'parent' | 'teacher' | 'school_admin' | 'super_admin';
  preferred_lang: 'ru' | 'zh';
  avatar_url?: string;
  is_active: boolean;
}

export interface Student {
  id: string;
  user_id: string;
  class_id: string;
  student_no: string;
  birth_date: string;
  gender: string;
  enrollment_date: string;
  status: string;
}

export interface Parent {
  id: string;
  user_id: string;
  occupation: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  employee_no: string;
  specialization: string;
  specialization_zh: string;
  status: string;
}

export interface ParentStudent {
  parent_id: string;
  student_id: string;
  relation: string;
  is_primary: boolean;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  title_zh: string;
  description: string;
  description_zh: string;
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
  title: string;
  title_zh: string;
  lesson_order: number;
  scheduled_at: string;
  duration_min: number;
  room: string;
  live_status: 'upcoming' | 'live' | 'finished';
}

export interface Homework {
  id: string;
  course_id: string;
  title: string;
  title_zh: string;
  description: string;
  hw_type: string;
  max_score: number;
  published_at: string;
  deadline_at: string;
  allow_late: boolean;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue' | 'resubmitted';
  submitted_at?: string;
  score?: number;
  correctness?: number;
  time_spent_min?: number;
}

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
  comment: string;
  rated_at: string;
}

export interface Attendance {
  id: number;
  student_id: string;
  lesson_id: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  marked_at: string;
}

export interface Achievement {
  id: string;
  student_id: string;
  category: 'class' | 'school' | 'external';
  title: string;
  title_zh: string;
  description: string;
  issuer: string;
  issued_date: string;
}

export interface Contest {
  id: string;
  title: string;
  title_zh: string;
  description: string;
  description_zh: string;
  rules: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  status: 'open' | 'closed' | 'cancelled' | 'completed';
}

export interface Event {
  id: string;
  title: string;
  title_zh: string;
  description: string;
  description_zh: string;
  event_type: string;
  start_at: string;
  end_at: string;
  location: string;
  is_paid: boolean;
  price: number;
  status: 'open' | 'closed' | 'cancelled' | 'completed';
}

export interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  title_zh: string;
  body: string;
  body_zh: string;
  is_read: boolean;
  created_at: string;
}

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
  description: string;
  description_zh: string;
  created_at: string;
}

export interface TeacherStudent {
  teacher_id: string;
  student_id: string;
  subject: string;
}

// =================== MOCK DATA ===================

export const mockUsers: User[] = [
  {
    id: 'u-student-1',
    username: 'student1',
    password_hash: '123',
    full_name: 'Иванов Иван Петрович',
    full_name_zh: '伊万诺夫·伊万',
    email: 'ivanov@student.cn',
    phone: '+7-999-111-11-11',
    role: 'student',
    preferred_lang: 'ru',
    is_active: true,
  },
  {
    id: 'u-student-2',
    username: 'student2',
    password_hash: '123',
    full_name: 'Иванова Анна Петровна',
    full_name_zh: '伊万诺娃·安娜',
    email: 'anna@student.cn',
    phone: '+7-999-222-22-22',
    role: 'student',
    preferred_lang: 'ru',
    is_active: true,
  },
  {
    id: 'u-parent-1',
    username: 'parent1',
    password_hash: '123',
    full_name: 'Иванов Пётр Сергеевич',
    full_name_zh: '伊万诺夫·彼得',
    email: 'ivanov@parent.cn',
    phone: '+7-999-333-33-33',
    role: 'parent',
    preferred_lang: 'ru',
    is_active: true,
  },
  {
    id: 'u-teacher-1',
    username: 'teacher1',
    password_hash: '123',
    full_name: 'Ли Мэй Хуа',
    full_name_zh: '李梅花',
    email: 'limei@school.cn',
    phone: '+7-999-444-44-44',
    role: 'teacher',
    preferred_lang: 'zh',
    is_active: true,
  },
  {
    id: 'u-teacher-2',
    username: 'teacher2',
    password_hash: '123',
    full_name: 'Ван Мин',
    full_name_zh: '王明',
    email: 'wangmin@school.cn',
    phone: '+7-999-555-55-55',
    role: 'teacher',
    preferred_lang: 'zh',
    is_active: true,
  },
];

export const mockStudents: Student[] = [
  {
    id: 's-1',
    user_id: 'u-student-1',
    class_id: 'c-1',
    student_no: 'STU-2024-001',
    birth_date: '2010-05-15',
    gender: 'male',
    enrollment_date: '2023-09-01',
    status: 'active',
  },
  {
    id: 's-2',
    user_id: 'u-student-2',
    class_id: 'c-1',
    student_no: 'STU-2024-002',
    birth_date: '2011-03-20',
    gender: 'female',
    enrollment_date: '2023-09-01',
    status: 'active',
  },
];

export const mockParents: Parent[] = [
  {
    id: 'p-1',
    user_id: 'u-parent-1',
    occupation: 'Инженер',
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: 't-1',
    user_id: 'u-teacher-1',
    employee_no: 'EMP-001',
    specialization: 'Китайский язык, Каллиграфия',
    specialization_zh: '汉语，书法',
    status: 'active',
  },
  {
    id: 't-2',
    user_id: 'u-teacher-2',
    employee_no: 'EMP-002',
    specialization: 'Математика, Логика',
    specialization_zh: '数学，逻辑',
    status: 'active',
  },
];

export const mockParentStudents: ParentStudent[] = [
  { parent_id: 'p-1', student_id: 's-1', relation: 'father', is_primary: true },
  { parent_id: 'p-1', student_id: 's-2', relation: 'father', is_primary: false },
];

export const mockTeacherStudents: TeacherStudent[] = [
  { teacher_id: 't-1', student_id: 's-1', subject: 'Китайский язык' },
  { teacher_id: 't-1', student_id: 's-2', subject: 'Китайский язык' },
  { teacher_id: 't-2', student_id: 's-1', subject: 'Математика' },
  { teacher_id: 't-2', student_id: 's-2', subject: 'Математика' },
];

export const mockCourses: Course[] = [
  {
    id: 'crs-1',
    code: 'ZH-101',
    title: 'Китайский язык — начальный',
    title_zh: '初级汉语',
    description: 'Основы китайского языка для начинающих',
    description_zh: '汉语入门基础',
    course_type: 'live',
    subject: 'Китайский язык',
    is_free: false,
    price: 15000,
    is_additional: false,
    status: 'published',
  },
  {
    id: 'crs-2',
    code: 'MATH-101',
    title: 'Математика — базовый курс',
    title_zh: '基础数学',
    description: 'Базовый курс математики',
    description_zh: '数学基础课程',
    course_type: 'live',
    subject: 'Математика',
    is_free: false,
    price: 12000,
    is_additional: false,
    status: 'published',
  },
  {
    id: 'crs-3',
    code: 'CALL-201',
    title: 'Каллиграфия',
    title_zh: '书法课',
    description: 'Дополнительное занятие по каллиграфии',
    description_zh: '书法选修课',
    course_type: 'offline',
    subject: 'Каллиграфия',
    is_free: true,
    price: 0,
    is_additional: true,
    status: 'published',
  },
  {
    id: 'crs-4',
    code: 'CULT-301',
    title: 'Культура Китая',
    title_zh: '中国文化',
    description: 'Дополнительное занятие по культуре',
    description_zh: '文化选修课',
    course_type: 'offline',
    subject: 'Культурология',
    is_free: true,
    price: 0,
    is_additional: true,
    status: 'published',
  },
];

export const mockLessons: CourseLesson[] = [
  {
    id: 'l-1',
    course_id: 'crs-1',
    title: 'Урок 1: Приветствия',
    title_zh: '第一课：问候',
    lesson_order: 1,
    scheduled_at: '2025-01-20T10:00:00',
    duration_min: 45,
    room: 'А-101',
    live_status: 'finished',
  },
  {
    id: 'l-2',
    course_id: 'crs-1',
    title: 'Урок 2: Числа',
    title_zh: '第二课：数字',
    lesson_order: 2,
    scheduled_at: '2025-01-22T10:00:00',
    duration_min: 45,
    room: 'А-101',
    live_status: 'finished',
  },
  {
    id: 'l-3',
    course_id: 'crs-1',
    title: 'Урок 3: Семья',
    title_zh: '第三课：家庭',
    lesson_order: 3,
    scheduled_at: '2025-01-27T10:00:00',
    duration_min: 45,
    room: 'А-101',
    live_status: 'live',
  },
  {
    id: 'l-4',
    course_id: 'crs-2',
    title: 'Урок 1: Арифметика',
    title_zh: '第一课：算术',
    lesson_order: 1,
    scheduled_at: '2025-01-21T14:00:00',
    duration_min: 60,
    room: 'Б-202',
    live_status: 'finished',
  },
  {
    id: 'l-5',
    course_id: 'crs-2',
    title: 'Урок 2: Геометрия',
    title_zh: '第二课：几何',
    lesson_order: 2,
    scheduled_at: '2025-01-28T14:00:00',
    duration_min: 60,
    room: 'Б-202',
    live_status: 'upcoming',
  },
  {
    id: 'l-6',
    course_id: 'crs-3',
    title: 'Занятие 1: Иероглифы',
    title_zh: '第一课：汉字',
    lesson_order: 1,
    scheduled_at: '2025-01-25T16:00:00',
    duration_min: 30,
    room: 'В-303',
    live_status: 'upcoming',
  },
];

export const mockHomeworks: Homework[] = [
  {
    id: 'hw-1',
    course_id: 'crs-1',
    title: 'Выучить приветствия',
    title_zh: '学习问候语',
    description: 'Выучить 10 приветствий на китайском',
    hw_type: 'vocabulary',
    max_score: 100,
    published_at: '2025-01-20T11:00:00',
    deadline_at: '2025-01-25T23:59:00',
    allow_late: false,
  },
  {
    id: 'hw-2',
    course_id: 'crs-1',
    title: 'Написать иероглифы',
    title_zh: '写汉字',
    description: 'Написать иероглифы из урока 2',
    hw_type: 'writing',
    max_score: 100,
    published_at: '2025-01-22T11:00:00',
    deadline_at: '2025-01-29T23:59:00',
    allow_late: true,
  },
  {
    id: 'hw-3',
    course_id: 'crs-2',
    title: 'Решить задачи',
    title_zh: '解题',
    description: 'Решить 10 задач по арифметике',
    hw_type: 'practice',
    max_score: 100,
    published_at: '2025-01-21T15:00:00',
    deadline_at: '2025-01-23T23:59:00',
    allow_late: false,
  },
  {
    id: 'hw-4',
    course_id: 'crs-1',
    title: 'Диалог с родителями',
    title_zh: '与父母对话',
    description: 'Провести диалог на китайском с родителями',
    hw_type: 'speaking',
    max_score: 50,
    published_at: '2025-01-15T11:00:00',
    deadline_at: '2025-01-18T23:59:00',
    allow_late: false,
  },
];

export const mockSubmissions: HomeworkSubmission[] = [
  {
    id: 'sub-1',
    homework_id: 'hw-1',
    student_id: 's-1',
    status: 'graded',
    submitted_at: '2025-01-24T18:00:00',
    score: 85,
    correctness: 85,
    time_spent_min: 30,
  },
  {
    id: 'sub-2',
    homework_id: 'hw-2',
    student_id: 's-1',
    status: 'pending',
  },
  {
    id: 'sub-3',
    homework_id: 'hw-3',
    student_id: 's-1',
    status: 'overdue',
  },
  {
    id: 'sub-4',
    homework_id: 'hw-4',
    student_id: 's-1',
    status: 'graded',
    submitted_at: '2025-01-17T20:00:00',
    score: 40,
    correctness: 80,
    time_spent_min: 15,
  },
];

export const mockGrades: Grade[] = [
  { id: 1, student_id: 's-1', subject: 'Китайский язык', grade_type: 'lesson', period_label: 'Январь 2025', score: 4.5, max_score: 5, graded_at: '2025-01-20' },
  { id: 2, student_id: 's-1', subject: 'Китайский язык', grade_type: 'lesson', period_label: 'Январь 2025', score: 5, max_score: 5, graded_at: '2025-01-22' },
  { id: 3, student_id: 's-1', subject: 'Математика', grade_type: 'lesson', period_label: 'Январь 2025', score: 4, max_score: 5, graded_at: '2025-01-21' },
  { id: 4, student_id: 's-1', subject: 'Китайский язык', grade_type: 'monthly', period_label: 'Декабрь 2024', score: 4.2, max_score: 5, graded_at: '2024-12-30' },
  { id: 5, student_id: 's-1', subject: 'Математика', grade_type: 'monthly', period_label: 'Декабрь 2024', score: 3.8, max_score: 5, graded_at: '2024-12-30' },
  { id: 6, student_id: 's-1', subject: 'Китайский язык', grade_type: 'semester', period_label: 'Осень 2024', score: 4.3, max_score: 5, graded_at: '2024-12-25' },
  { id: 7, student_id: 's-2', subject: 'Китайский язык', grade_type: 'lesson', period_label: 'Январь 2025', score: 5, max_score: 5, graded_at: '2025-01-20' },
  { id: 8, student_id: 's-2', subject: 'Математика', grade_type: 'lesson', period_label: 'Январь 2025', score: 4.5, max_score: 5, graded_at: '2025-01-21' },
];

export const mockLessonRatings: LessonRating[] = [
  { id: 1, lesson_id: 'l-1', student_id: 's-1', stars: 5, comment: 'Отличная работа на уроке!', rated_at: '2025-01-20' },
  { id: 2, lesson_id: 'l-2', student_id: 's-1', stars: 4, comment: 'Хорошо, но нужно больше практики', rated_at: '2025-01-22' },
  { id: 3, lesson_id: 'l-4', student_id: 's-1', stars: 4, comment: 'Внимателен на уроке', rated_at: '2025-01-21' },
];

export const mockAttendance: Attendance[] = [
  { id: 1, student_id: 's-1', lesson_id: 'l-1', status: 'present', marked_at: '2025-01-20' },
  { id: 2, student_id: 's-1', lesson_id: 'l-2', status: 'present', marked_at: '2025-01-22' },
  { id: 3, student_id: 's-1', lesson_id: 'l-4', status: 'late', marked_at: '2025-01-21' },
  { id: 4, student_id: 's-2', lesson_id: 'l-1', status: 'present', marked_at: '2025-01-20' },
  { id: 5, student_id: 's-2', lesson_id: 'l-2', status: 'absent', marked_at: '2025-01-22' },
  { id: 6, student_id: 's-2', lesson_id: 'l-4', status: 'present', marked_at: '2025-01-21' },
];

export const mockAchievements: Achievement[] = [
  {
    id: 'ach-1',
    student_id: 's-1',
    category: 'class',
    title: 'Лучший ученик месяца',
    title_zh: '月度最佳学生',
    description: 'За отличные результаты в январе',
    issuer: 'Школа Конфуция',
    issued_date: '2025-01-31',
  },
  {
    id: 'ach-2',
    student_id: 's-1',
    category: 'school',
    title: 'Победитель олимпиады по каллиграфии',
    title_zh: '书法比赛冠军',
    description: '1 место в школьной олимпиаде',
    issuer: 'Школа Конфуция',
    issued_date: '2024-12-15',
  },
  {
    id: 'ach-3',
    student_id: 's-1',
    category: 'external',
    title: 'HSK Level 2',
    title_zh: 'HSK 二级',
    description: 'Сертификат HSK Level 2',
    issuer: 'Hanban',
    issued_date: '2024-11-20',
  },
];

export const mockContests: Contest[] = [
  {
    id: 'cnt-1',
    title: 'Конкурс каллиграфии',
    title_zh: '书法比赛',
    description: 'Ежегодный конкурс каллиграфии среди учеников',
    description_zh: '年度学生书法比赛',
    rules: 'Участники пишут иероглифы в течение 30 минут',
    start_date: '2025-02-15',
    end_date: '2025-02-15',
    registration_deadline: '2025-02-10',
    status: 'open',
  },
  {
    id: 'cnt-2',
    title: 'Конкурс чтецов',
    title_zh: '朗诵比赛',
    description: 'Чтение стихов на китайском языке',
    description_zh: '中文诗歌朗诵',
    rules: 'Стихотворение наизусть, 2-3 минуты',
    start_date: '2025-03-01',
    end_date: '2025-03-01',
    registration_deadline: '2025-02-25',
    status: 'open',
  },
];

export const mockEvents: Event[] = [
  {
    id: 'evt-1',
    title: 'День открытых дверей',
    title_zh: '开放日',
    description: 'Приглашаем на день открытых дверей!',
    description_zh: '欢迎参加开放日！',
    event_type: 'open_day',
    start_at: '2025-02-20T10:00:00',
    end_at: '2025-02-20T16:00:00',
    location: 'Главный корпус',
    is_paid: false,
    price: 0,
    status: 'open',
  },
  {
    id: 'evt-2',
    title: 'Праздник весны',
    title_zh: '春节庆典',
    description: 'Празднование Китайского нового года',
    description_zh: '庆祝中国新年',
    event_type: 'cultural',
    start_at: '2025-01-29T18:00:00',
    end_at: '2025-01-29T22:00:00',
    location: 'Актовый зал',
    is_paid: true,
    price: 500,
    status: 'open',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    user_id: 'u-student-1',
    type: 'homework',
    title: 'Новое домашнее задание',
    title_zh: '新作业',
    body: 'Выучить приветствия — дедлайн 25 января',
    body_zh: '学习问候语 — 截止1月25日',
    is_read: false,
    created_at: '2025-01-20T11:00:00',
  },
  {
    id: 2,
    user_id: 'u-student-1',
    type: 'course',
    title: 'Напоминание о занятии',
    title_zh: '课程提醒',
    body: 'Через 15 минут начинается урок китайского языка',
    body_zh: '15分钟后开始汉语课',
    is_read: false,
    created_at: '2025-01-27T09:45:00',
  },
  {
    id: 3,
    user_id: 'u-student-1',
    type: 'system',
    title: 'Оценка выставлена',
    title_zh: '成绩已发布',
    body: 'Вам выставлена оценка за урок "Числа"',
    body_zh: '您已获得"数字"课的成绩',
    is_read: true,
    created_at: '2025-01-22T15:00:00',
  },
  {
    id: 4,
    user_id: 'u-parent-1',
    type: 'school',
    title: 'День открытых дверей',
    title_zh: '开放日',
    body: '20 февраля — день открытых дверей',
    body_zh: '2月20日开放日',
    is_read: false,
    created_at: '2025-01-25T10:00:00',
  },
];

export const mockPointsAccounts: PointsAccount[] = [
  { user_id: 'u-parent-1', balance: 450000, total_earned: 600000 },
];

export const mockPointsTransactions: PointsTransaction[] = [
  { id: 1, user_id: 'u-parent-1', source: 'purchase', amount: 150000, description: 'Покупка курса', description_zh: '购买课程', created_at: '2024-12-01' },
  { id: 2, user_id: 'u-parent-1', source: 'referral', amount: 50000, description: 'Привлечение друга', description_zh: '推荐好友', created_at: '2024-12-15' },
  { id: 3, user_id: 'u-parent-1', source: 'purchase', amount: 250000, description: 'Покупка учебников', description_zh: '购买教材', created_at: '2025-01-10' },
  { id: 4, user_id: 'u-parent-1', source: 'manual', amount: 150000, description: 'Бонус за активность', description_zh: '活跃奖励', created_at: '2025-01-20' },
];

// Helper: find user by credentials
export function authenticateUser(username: string, password: string): User | null {
  const user = mockUsers.find(u => u.username === username && u.password_hash === password);
  return user || null;
}

// Helper: get student by user_id
export function getStudentByUserId(userId: string): Student | undefined {
  return mockStudents.find(s => s.user_id === userId);
}

// Helper: get parent by user_id
export function getParentByUserId(userId: string): Parent | undefined {
  return mockParents.find(p => p.user_id === userId);
}

// Helper: get teacher by user_id
export function getTeacherByUserId(userId: string): Teacher | undefined {
  return mockTeachers.find(t => t.user_id === userId);
}

// Helper: get children of a parent
export function getChildrenOfParent(parentId: string): Student[] {
  const links = mockParentStudents.filter(ps => ps.parent_id === parentId);
  return links.map(l => mockStudents.find(s => s.id === l.student_id)!).filter(Boolean);
}

// Helper: get user by id
export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}
