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
  class_id: string;  // Привязка к классу
  title: string;
  title_zh: string;
  lesson_order: number;
  scheduled_at: string;
  duration_min: number;
  room: string;
  live_status: 'upcoming' | 'live' | 'finished';
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
  progress_pct: number;
  contract_signed: boolean;
  paid: boolean;
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

// =================== ГЕНЕРАЦИЯ ДАННЫХ ===================

// Русские имена
const russianFirstNames = ['Иван', 'Пётр', 'Анна', 'Мария', 'Алексей', 'Елена', 'Дмитрий', 'Ольга', 'Сергей', 'Наталья', 'Андрей', 'Татьяна', 'Михаил', 'Екатерина', 'Николай'];
const russianLastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Волков', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов'];
const russianMiddleNames = ['Сергеевич', 'Петрович', 'Александрович', 'Дмитриевич', 'Николаевич', 'Сергеевна', 'Петровна', 'Александровна', 'Дмитриевна', 'Николаевна'];

// Китайские имена
const chineseSurnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
const chineseGivenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '洋', '勇', '艳', '杰', '娟', '涛', '明'];

// Функция генерации случайного числа
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция выбора случайного элемента
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Генерация телефона по формуле (хранится без дефисов)
function generatePhone(type: 'student1' | 'student2' | 'parent' | 'teacher', n: number): string {
  if (type === 'teacher') {
    // Учителя: +79998881000, +79998882000, ..., +799988810000
    const lastDigits = 1000 * (n + 1);
    return `+7999888${String(lastDigits)}`;
  }
  
  let lastFour: number;
  if (type === 'student1') {
    lastFour = 3 * n + 1;
  } else if (type === 'student2') {
    lastFour = 3 * n + 2;
  } else {
    lastFour = 3 * n + 3;
  }
  return `+7999888${String(lastFour).padStart(4, '0')}`;
}

// Генерация имени
function generateName(gender: 'male' | 'female'): { ru: string; zh: string } {
  const isMale = gender === 'male';
  const firstName = randomChoice(isMale ? russianFirstNames.filter(n => ['Иван', 'Пётр', 'Алексей', 'Дмитрий', 'Сергей', 'Андрей', 'Михаил', 'Николай'].includes(n)) : russianFirstNames.filter(n => ['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Татьяна', 'Екатерина'].includes(n)));
  const lastName = randomChoice(russianLastNames) + (isMale ? '' : 'а');
  const middleName = randomChoice(isMale ? russianMiddleNames.filter(n => n.endsWith('вич')) : russianMiddleNames.filter(n => n.endsWith('вна')));
  
  const chineseSurname = randomChoice(chineseSurnames);
  const chineseGiven = randomChoice(chineseGivenNames) + (Math.random() > 0.5 ? randomChoice(chineseGivenNames) : '');
  
  return {
    ru: `${lastName} ${firstName} ${middleName}`,
    zh: `${chineseSurname}${chineseGiven}`
  };
}

// Генерация данных для 6 классов
const classes = ['A-1', 'A-2', 'B-1', 'B-2', 'C-1', 'C-2'];
const classRanges = [[0, 4], [5, 9], [10, 14], [15, 19], [20, 24], [25, 29]];

// =================== MOCK DATA ===================

export const mockUsers: User[] = [];
export const mockStudents: Student[] = [];
export const mockParents: Parent[] = [];
export const mockTeachers: Teacher[] = [];
export const mockParentStudents: ParentStudent[] = [];
export const mockTeacherStudents: TeacherStudent[] = [];
export const mockCourses: Course[] = [];
// Генерация уроков для периода 12-30 октября 2026
// Один урок в день на каждый класс
const generateMockLessons = (): CourseLesson[] => {
  const lessons: CourseLesson[] = [];
  const classes: Array<{id: string; name: string; course_id: 'crs-1' | 'crs-2' | 'crs-3'; room: string; time: string}> = [
    { id: 'class-1', name: 'A-1', course_id: 'crs-1', room: 'А-101', time: '09:00' },
    { id: 'class-2', name: 'A-2', course_id: 'crs-1', room: 'А-102', time: '10:00' },
    { id: 'class-3', name: 'B-1', course_id: 'crs-2', room: 'Б-201', time: '11:00' },
    { id: 'class-4', name: 'B-2', course_id: 'crs-2', room: 'Б-202', time: '12:00' },
    { id: 'class-5', name: 'C-1', course_id: 'crs-3', room: 'В-301', time: '14:00' },
    { id: 'class-6', name: 'C-2', course_id: 'crs-3', room: 'В-302', time: '15:00' },
  ];
  
  const lessonTitles = {
    'crs-1': {
      ru: ['Приветствия', 'Числа', 'Семья', 'Еда', 'Цвета', 'Животные', 'Школа', 'Дом', 'Погода', 'Время', 'Транспорт', 'Одежда', 'Тело', 'Эмоции', 'Хобби', 'Спорт', 'Музыка', 'Путешествия', 'Работа'],
      zh: ['问候', '数字', '家庭', '食物', '颜色', '动物', '学校', '家', '天气', '时间', '交通', '衣服', '身体', '情绪', '爱好', '运动', '音乐', '旅行', '工作']
    },
    'crs-2': {
      ru: ['Арифметика', 'Геометрия', 'Алгебра', 'Задачи', 'Уравнения', 'Дроби', 'Проценты', 'Графики', 'Статистика', 'Вероятность', 'Логика', 'Площади', 'Объёмы', 'Координаты', 'Функции', 'Пропорции', 'Степени', 'Корни', 'Множества'],
      zh: ['算术', '几何', '代数', '问题', '方程', '分数', '百分比', '图表', '统计', '概率', '逻辑', '面积', '体积', '坐标', '函数', '比例', '幂', '根', '集合']
    },
    'crs-3': {
      ru: ['Иероглифы', 'Штрихи', 'Компоненты', 'Практика', 'Сочинение', 'Каллиграфия', 'Письмо', 'Чтение', 'Диктант', 'Творчество', 'История', 'Культура', 'Искусство', 'Философия', 'Поэзия', 'Литература', 'Театр', 'Музыка', 'Танцы'],
      zh: ['汉字', '笔画', '组件', '练习', '作文', '书法', '写作', '阅读', '听写', '创作', '历史', '文化', '艺术', '哲学', '诗歌', '文学', '戏剧', '音乐', '舞蹈']
    }
  };
  
  let lessonId = 1;
  
  // Период: 12-30 октября 2026 (19 дней)
  for (let day = 12; day <= 30; day++) {
    const date = `2026-10-${day.toString().padStart(2, '0')}`;
    const dayIndex = day - 12; // 0-18
    
    classes.forEach((classInfo, classIndex) => {
      const titleIndex = dayIndex % lessonTitles[classInfo.course_id].ru.length;
      
      lessons.push({
        id: `l-${lessonId}`,
        course_id: classInfo.course_id,
        class_id: classInfo.id,  // Привязка к классу
        title: `Урок ${dayIndex + 1}: ${lessonTitles[classInfo.course_id].ru[titleIndex]}`,
        title_zh: `第${dayIndex + 1}课：${lessonTitles[classInfo.course_id].zh[titleIndex]}`,
        lesson_order: dayIndex + 1,
        scheduled_at: `${date}T${classInfo.time}:00`,
        duration_min: classInfo.course_id === 'crs-3' ? 30 : 45,
        room: classInfo.room,
        live_status: day < 20 ? 'finished' : day === 20 ? 'live' : 'upcoming',
      });
      
      lessonId++;
    });
  }
  
  return lessons;
};

// Уроки будут сгенерированы после создания курсов и записей
export let mockLessons: CourseLesson[] = [];
export const mockCourseEnrollments: CourseEnrollment[] = [];
export const mockHomeworks: Homework[] = [];
export const mockSubmissions: HomeworkSubmission[] = [];
export const mockGrades: Grade[] = [];
export const mockLessonRatings: LessonRating[] = [];
export const mockAttendance: Attendance[] = [];
export const mockAchievements: Achievement[] = [];
export const mockContests: Contest[] = [];
export const mockEvents: Event[] = [];
export const mockNotifications: Notification[] = [];
export const mockPointsAccounts: PointsAccount[] = [];
export const mockPointsTransactions: PointsTransaction[] = [];

// Генерация учеников и родителей
let studentCounter = 1;
let parentCounter = 1;

classes.forEach((className, classIndex) => {
  const [startN, endN] = classRanges[classIndex];
  
  for (let n = startN; n <= endN; n++) {
    // Два ученика на каждое значение n
    for (let i = 0; i < 2; i++) {
      const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
      const name = generateName(gender);
      const studentId = `s-${studentCounter}`;
      const userId = `u-student-${studentCounter}`;
      const phone = generatePhone(i === 0 ? 'student1' : 'student2', n);
      
      mockUsers.push({
        id: userId,
        username: `student${studentCounter}`,
        password_hash: '123',
        full_name: name.ru,
        full_name_zh: name.zh,
        email: `student${studentCounter}@confucius.ru`,
        phone: phone,
        role: 'student',
        preferred_lang: 'ru',
        is_active: true,
      });
      
      mockStudents.push({
        id: studentId,
        user_id: userId,
        class_id: `class-${classIndex + 1}`,
        student_no: `STU-2024-${String(studentCounter).padStart(3, '0')}`,
        birth_date: `${randomInt(2008, 2012)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
        gender: gender,
        enrollment_date: '2023-09-01',
        status: 'active',
      });
      
      // Родитель для этого ученика
      const parentGender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
      const parentName = generateName(parentGender);
      const parentId = `p-${parentCounter}`;
      const parentUserId = `u-parent-${parentCounter}`;
      const parentPhone = generatePhone('parent', n);
      
      mockUsers.push({
        id: parentUserId,
        username: `parent${parentCounter}`,
        password_hash: '123',
        full_name: parentName.ru,
        full_name_zh: parentName.zh,
        email: `parent${parentCounter}@confucius.ru`,
        phone: parentPhone,
        role: 'parent',
        preferred_lang: 'ru',
        is_active: true,
      });
      
      const occupations = ['Инженер', 'Врач', 'Учитель', 'Предприниматель', 'Менеджер', 'Программист', 'Бухгалтер', 'Юрист'];
      mockParents.push({
        id: parentId,
        user_id: parentUserId,
        occupation: randomChoice(occupations),
      });
      
      mockParentStudents.push({
        parent_id: parentId,
        student_id: studentId,
        relation: parentGender === 'male' ? 'father' : 'mother',
        is_primary: true,
      });
      
      studentCounter++;
      parentCounter++;
    }
  }
});

// Генерация учителей (10 учителей)
for (let n = 0; n < 10; n++) {
  const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
  const name = generateName(gender);
  const teacherId = `t-${n + 1}`;
  const userId = `u-teacher-${n + 1}`;
  const phone = generatePhone('teacher', n);
  
  const specializations = [
    { ru: 'Китайский язык', zh: '汉语' },
    { ru: 'Математика', zh: '数学' },
    { ru: 'Каллиграфия', zh: '书法' },
    { ru: 'История Китая', zh: '中国历史' },
    { ru: 'Литература', zh: '文学' },
  ];
  const spec = randomChoice(specializations);
  
  mockUsers.push({
    id: userId,
    username: `teacher${n + 1}`,
    password_hash: '123',
    full_name: name.ru,
    full_name_zh: name.zh,
    email: `teacher${n + 1}@confucius.ru`,
    phone: phone,
    role: 'teacher',
    preferred_lang: Math.random() > 0.5 ? 'ru' : 'zh',
    is_active: true,
  });
  
  mockTeachers.push({
    id: teacherId,
    user_id: userId,
    employee_no: `EMP-${String(n + 1).padStart(3, '0')}`,
    specialization: spec.ru,
    specialization_zh: spec.zh,
    status: 'active',
  });
}

// Назначить учителей ученикам
mockStudents.forEach((student, idx) => {
  const teacherIdx = idx % mockTeachers.length;
  mockTeacherStudents.push({
    teacher_id: mockTeachers[teacherIdx].id,
    student_id: student.id,
    subject: mockTeachers[teacherIdx].specialization,
  });
});

// Курсы
const courseData = [
  { code: 'ZH-101', title: 'Китайский язык — начальный', title_zh: '初级汉语', subject: 'Китайский язык', type: 'live' as const, additional: false },
  { code: 'MATH-101', title: 'Математика — базовый курс', title_zh: '基础数学', subject: 'Математика', type: 'live' as const, additional: false },
  { code: 'CALL-201', title: 'Каллиграфия', title_zh: '书法课', subject: 'Каллиграфия', type: 'offline' as const, additional: true },
  { code: 'CULT-301', title: 'Культура Китая', title_zh: '中国文化', subject: 'Культурология', type: 'offline' as const, additional: true },
];

courseData.forEach((c, idx) => {
  mockCourses.push({
    id: `crs-${idx + 1}`,
    code: c.code,
    title: c.title,
    title_zh: c.title_zh,
    description: `Курс "${c.title}"`,
    description_zh: `课程"${c.title_zh}"`,
    course_type: c.type,
    subject: c.subject,
    is_free: c.additional,
    price: c.additional ? 0 : randomInt(10000, 20000),
    is_additional: c.additional,
    status: 'published',
  });
});

// Записи на курсы для всех студентов
let enrollmentCounter = 1;
mockStudents.forEach(student => {
  // Все студенты записаны на основные курсы (crs-1 и crs-2)
  mockCourseEnrollments.push({
    id: `enr-${enrollmentCounter++}`,
    course_id: 'crs-1',
    student_id: student.id,
    enrolled_at: '2024-09-01',
    progress_pct: randomInt(30, 80),
    contract_signed: true,
    paid: true,
  });
  mockCourseEnrollments.push({
    id: `enr-${enrollmentCounter++}`,
    course_id: 'crs-2',
    student_id: student.id,
    enrolled_at: '2024-09-01',
    progress_pct: randomInt(20, 70),
    contract_signed: true,
    paid: true,
  });
  
  // 50% студентов записаны на дополнительные курсы
  if (Math.random() > 0.5) {
    mockCourseEnrollments.push({
      id: `enr-${enrollmentCounter++}`,
      course_id: 'crs-3',
      student_id: student.id,
      enrolled_at: '2024-09-15',
      progress_pct: randomInt(10, 60),
      contract_signed: false,
      paid: false,
    });
  }
  if (Math.random() > 0.7) {
    mockCourseEnrollments.push({
      id: `enr-${enrollmentCounter++}`,
      course_id: 'crs-4',
      student_id: student.id,
      enrolled_at: '2024-09-15',
      progress_pct: randomInt(10, 50),
      contract_signed: false,
      paid: false,
    });
  }
});

// Генерируем уроки после создания курсов и записей
mockLessons = generateMockLessons();

// Домашние задания (привязаны к урокам октября 2026)
let hwCounter = 1;
mockCourses.slice(0, 2).forEach(course => {
  for (let i = 1; i <= 3; i++) {
    const day = 12 + (i - 1) * 3; // 12, 15, 18 октября
    mockHomeworks.push({
      id: `hw-${hwCounter}`,
      course_id: course.id,
      title: `Задание ${i}`,
      title_zh: `作业${i}`,
      description: `Выполнить задание по курсу "${course.title}"`,
      hw_type: randomChoice(['vocabulary', 'writing', 'practice', 'speaking']),
      max_score: 100,
      published_at: `2026-10-${String(day).padStart(2, '0')}T10:00:00`,
      deadline_at: `2026-10-${String(day + 2).padStart(2, '0')}T23:59:00`,
      allow_late: Math.random() > 0.5,
    });
    hwCounter++;
  }
});

// Оценки, посещаемость, достижения и т.д. для каждого ученика
let gradeId = 1;
let attendanceId = 1;
let ratingId = 1;
let submissionId = 1;

mockStudents.forEach(student => {
  // Оценки
  for (let i = 0; i < randomInt(5, 15); i++) {
    mockGrades.push({
      id: gradeId++,
      student_id: student.id,
      subject: randomChoice(['Китайский язык', 'Математика']),
      grade_type: randomChoice(['lesson', 'monthly', 'semester']),
      period_label: 'Октябрь 2026',
      score: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      max_score: 5,
      graded_at: `2026-10-${String(randomInt(12, 20)).padStart(2, '0')}`,
    });
  }
  
  // Посещаемость
  mockLessons.slice(0, 5).forEach(lesson => {
    const statuses: Array<'present' | 'late' | 'absent' | 'excused'> = ['present', 'present', 'present', 'late', 'absent'];
    mockAttendance.push({
      id: attendanceId++,
      student_id: student.id,
      lesson_id: lesson.id,
      status: randomChoice(statuses),
      marked_at: lesson.scheduled_at.split('T')[0],
    });
  });
  
  // Рейтинги уроков
  mockLessons.slice(0, 3).forEach(lesson => {
    mockLessonRatings.push({
      id: ratingId++,
      lesson_id: lesson.id,
      student_id: student.id,
      stars: randomInt(3, 5),
      comment: randomChoice(['Отличная работа!', 'Хорошо, но нужно больше практики', 'Внимателен на уроке', 'Активно участвует']),
      rated_at: lesson.scheduled_at.split('T')[0],
    });
  });
  
  // Домашние задания
  mockHomeworks.slice(0, 2).forEach(hw => {
    const statuses: Array<'pending' | 'submitted' | 'graded' | 'overdue'> = ['pending', 'graded', 'graded', 'overdue'];
    const status = randomChoice(statuses);
    mockSubmissions.push({
      id: `sub-${submissionId++}`,
      homework_id: hw.id,
      student_id: student.id,
      status: status,
      submitted_at: status !== 'pending' ? `2026-10-${String(randomInt(12, 20)).padStart(2, '0')}T18:00:00` : undefined,
      score: status === 'graded' ? randomInt(60, 100) : undefined,
      correctness: status === 'graded' ? randomInt(60, 100) : undefined,
      time_spent_min: status !== 'pending' ? randomInt(15, 60) : undefined,
    });
  });
  
  // Достижения (не у всех)
  if (Math.random() > 0.6) {
    const categories: Array<'class' | 'school' | 'external'> = ['class', 'school', 'external'];
    const cat = randomChoice(categories);
    mockAchievements.push({
      id: `ach-${student.id}`,
      student_id: student.id,
      category: cat,
      title: cat === 'class' ? 'Лучший ученик месяца' : cat === 'school' ? 'Победитель олимпиады' : 'Сертификат HSK',
      title_zh: cat === 'class' ? '月度最佳学生' : cat === 'school' ? '比赛冠军' : 'HSK证书',
      description: 'За отличные результаты',
      issuer: 'Школа Конфуция',
      issued_date: `2024-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
    });
  }
});

// Конкурсы
mockContests.push(
  {
    id: 'cnt-1',
    title: 'Конкурс каллиграфии',
    title_zh: '书法比赛',
    description: 'Ежегодный конкурс каллиграфии',
    description_zh: '年度书法比赛',
    rules: 'Участники пишут иероглифы в течение 30 минут',
    start_date: '2026-11-15',
    end_date: '2026-11-15',
    registration_deadline: '2026-11-10',
    status: 'open',
  },
  {
    id: 'cnt-2',
    title: 'Конкурс чтецов',
    title_zh: '朗诵比赛',
    description: 'Чтение стихов на китайском языке',
    description_zh: '中文诗歌朗诵',
    rules: 'Стихотворение наизусть, 2-3 минуты',
    start_date: '2026-12-01',
    end_date: '2026-12-01',
    registration_deadline: '2026-11-25',
    status: 'open',
  }
);

// Мероприятия
mockEvents.push(
  {
    id: 'evt-1',
    title: 'День открытых дверей',
    title_zh: '开放日',
    description: 'Приглашаем на день открытых дверей!',
    description_zh: '欢迎参加开放日！',
    event_type: 'open_day',
    start_at: '2026-11-20T10:00:00',
    end_at: '2026-11-20T16:00:00',
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
    start_at: '2027-01-29T18:00:00',
    end_at: '2027-01-29T22:00:00',
    location: 'Актовый зал',
    is_paid: true,
    price: 500,
    status: 'open',
  }
);

// Уведомления для первых нескольких пользователей
mockUsers.slice(0, 10).forEach((user, idx) => {
  mockNotifications.push({
    id: idx + 1,
    user_id: user.id,
    type: 'system',
    title: 'Добро пожаловать!',
    title_zh: '欢迎！',
    body: 'Ваш аккаунт успешно создан',
    body_zh: '您的账户已成功创建',
    is_read: false,
    created_at: '2026-10-12T10:00:00',
  });
});

// Баллы для родителей
mockParents.forEach((parent, idx) => {
  mockPointsAccounts.push({
    user_id: parent.user_id,
    balance: randomInt(100000, 500000),
    total_earned: randomInt(500000, 1000000),
  });
  
  mockPointsTransactions.push({
    id: idx + 1,
    user_id: parent.user_id,
    source: 'purchase',
    amount: randomInt(50000, 200000),
    description: 'Покупка курса',
    description_zh: '购买课程',
    created_at: '2026-09-15',
  });
});

// Helper: find user by credentials (username, email, or phone)
export function authenticateUser(identifier: string, password: string): User | null {
  // Нормализуем телефон для сравнения (убираем всё кроме цифр)
  const normalizedInput = identifier.replace(/\D/g, '');
  
  const user = mockUsers.find(u => {
    // ВРЕМЕННО: Проверка пароля отключена для отладки
    // TODO: Включить обратно после исправления хэшей
    // if (u.password_hash !== password) return false;
    
    // Проверка по username
    if (u.username === identifier) return true;
    
    // Проверка по email
    if (u.email === identifier) return true;
    
    // Проверка по телефону (сравниваем нормализованные номера)
    const userPhone = u.phone.replace(/\D/g, '');
    
    // Если введено 11 цифр - точное сравнение
    if (normalizedInput.length === 11 && userPhone === normalizedInput) return true;
    
    // Если введено больше 11 цифр - берём последние 11
    if (normalizedInput.length > 11) {
      const last11 = normalizedInput.slice(-11);
      if (userPhone === last11) return true;
    }
    
    // Если введено меньше 11 цифр - проверяем окончание
    if (normalizedInput.length > 0 && normalizedInput.length < 11) {
      if (userPhone.endsWith(normalizedInput)) return true;
    }
    
    return false;
  });
  
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
