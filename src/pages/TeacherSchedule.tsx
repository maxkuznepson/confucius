import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { mockLessons, mockTeacherStudents, mockStudents, mockCourses } from '../data/mock';
import { ChevronLeft, ChevronRight, Calendar, ArrowLeft } from 'lucide-react';

interface TeacherScheduleProps {
  teacherId: string;
}

type ViewMode = 'calendar' | 'day';

export function TeacherSchedule({ teacherId }: TeacherScheduleProps) {
  const { lang, darkMode } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Получаем все классы учителя
  const teacherClasses = useMemo(() => {
    const studentIds = mockTeacherStudents
      .filter(ts => ts.teacher_id === teacherId)
      .map(ts => ts.student_id);
    
    const classes = new Set<string>();
    studentIds.forEach(studentId => {
      const student = mockStudents.find(s => s.id === studentId);
      if (student?.class_id) {
        classes.add(student.class_id);
      }
    });
    
    return Array.from(classes);
  }, [teacherId]);

  // Получаем все уроки учителя на текущий год
  const teacherLessons = useMemo(() => {
    return mockLessons.filter(lesson => {
      // Проверяем, что урок для класса учителя
      if (!teacherClasses.includes(lesson.class_id)) return false;
      
      // Проверяем, что урок в текущем году
      const lessonDate = new Date(lesson.scheduled_at);
      return lessonDate.getFullYear() === year;
    });
  }, [teacherClasses, year]);

  // Группируем уроки по датам
  const lessonsByDate = useMemo(() => {
    const grouped: Record<string, typeof teacherLessons> = {};
    teacherLessons.forEach(lesson => {
      const dateKey = new Date(lesson.scheduled_at).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(lesson);
    });
    return grouped;
  }, [teacherLessons]);

  // Уроки на выбранную дату
  const selectedDayLessons = useMemo(() => {
    if (!selectedDate) return [];
    return lessonsByDate[selectedDate.toDateString()] || [];
  }, [selectedDate, lessonsByDate]);

  // Генерация календаря
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем день недели первого дня месяца (0=вс, 1=пн, ..., 6=сб)
    let firstDayOfWeek = firstDay.getDay();
    // Преобразуем в формат пн=0, вт=1, ..., вс=6
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days: Array<{ date: Date | null; dayNumber: number | null }> = [];
    
    // Добавляем пустые ячейки до первого дня месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, dayNumber: null });
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, dayNumber: day });
    }
    
    return days;
  }, [year, month]);

  const monthNames = lang === 'ru' 
    ? ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    : ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  const weekDays = lang === 'ru'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    
    // Проверяем, что год не изменился
    if (newDate.getFullYear() === year) {
      setCurrentDate(newDate);
    }
  };

  const handleDayClick = (date: Date) => {
    const dateKey = date.toDateString();
    if (lessonsByDate[dateKey]) {
      setSelectedDate(date);
      setViewMode('day');
    }
  };

  const bgClass = darkMode ? 'bg-[#1A1410]' : 'bg-[#FFF3C4]';
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';
  const textClass = darkMode ? 'text-[#F5E6D3]' : 'text-[#212121]';

  // Режим просмотра дня
  if (viewMode === 'day' && selectedDate) {
    return (
      <div className={`space-y-4 ${textClass}`}>
        {/* Заголовок с кнопкой назад */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg ${darkMode ? 'bg-[#4A3A1A] hover:bg-[#5A4A2A]' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-lg font-bold">
              {selectedDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'zh-CN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </h3>
            <p className="text-xs opacity-60">
              {selectedDayLessons.length} {lang === 'ru' ? 'урок(ов)' : '节课'}
            </p>
          </div>
        </div>

        {/* Список уроков */}
        <div className="space-y-2">
          {selectedDayLessons
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
            .map(lesson => {
              const lessonDate = new Date(lesson.scheduled_at);
              const course = mockCourses.find(c => c.id === lesson.course_id);
              
              return (
                <div
                  key={lesson.id}
                  className={`${cardBg} rounded-xl p-4 shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {lang === 'ru' ? lesson.title : lesson.title_zh}
                      </p>
                      <p className="text-xs opacity-60 mt-1">
                        {course && (lang === 'ru' ? course.title : course.title_zh)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      lesson.live_status === 'live' ? 'bg-red-500 text-white' :
                      lesson.live_status === 'upcoming' ? 'bg-green-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {t(lesson.live_status, lang)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs opacity-70">
                    <span>🕐 {lessonDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>📍 {lesson.room}</span>
                    <span>⏱️ {lesson.duration_min} {lang === 'ru' ? 'мин' : '分钟'}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // Режим календаря
  return (
    <div className={`space-y-4 ${textClass}`}>
      {/* Навигация по месяцам */}
      <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeMonth(-1)}
            disabled={month === 0}
            className={`p-2 rounded-lg transition-colors ${
              month === 0 
                ? 'opacity-30 cursor-not-allowed' 
                : darkMode ? 'bg-[#4A3A1A] hover:bg-[#5A4A2A]' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center">
            <h3 className="text-lg font-bold">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs opacity-60">
              {teacherLessons.length} {lang === 'ru' ? 'урок(ов) в году' : '节课/年'}
            </p>
          </div>
          
          <button
            onClick={() => changeMonth(1)}
            disabled={month === 11}
            className={`p-2 rounded-lg transition-colors ${
              month === 11 
                ? 'opacity-30 cursor-not-allowed' 
                : darkMode ? 'bg-[#4A3A1A] hover:bg-[#5A4A2A]' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Заголовки дней недели */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={`text-center text-xs font-medium py-2 ${
                idx >= 5 
                  ? darkMode ? 'text-[#E53935]' : 'text-red-600' 
                  : 'opacity-60'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Дни месяца */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (!day.date) {
              return <div key={idx} className="aspect-square" />;
            }

            const dateKey = day.date.toDateString();
            const hasLessons = !!lessonsByDate[dateKey];
            const lessonsCount = lessonsByDate[dateKey]?.length || 0;
            const isToday = day.date.toDateString() === new Date().toDateString();
            const dayOfWeek = day.date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <button
                key={idx}
                onClick={() => hasLessons && handleDayClick(day.date!)}
                disabled={!hasLessons}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center
                  transition-all relative
                  ${hasLessons 
                    ? darkMode 
                      ? 'bg-[#4A3A1A] hover:bg-[#5A4A2A] cursor-pointer' 
                      : 'bg-[#FBC02D]/20 hover:bg-[#FBC02D]/40 cursor-pointer'
                    : darkMode 
                      ? 'bg-[#2A2018]/50' 
                      : 'bg-gray-100/50'
                  }
                  ${isToday ? 'ring-2 ring-red-500' : ''}
                  ${isWeekend && hasLessons ? (darkMode ? 'text-[#E53935]' : 'text-red-600') : ''}
                `}
              >
                <span className={`text-sm font-medium ${hasLessons ? 'underline' : ''}`}>
                  {day.dayNumber}
                </span>
                {hasLessons && (
                  <span className="text-[10px] opacity-60 mt-0.5">
                    {lessonsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Легенда */}
      <div className={`${cardBg} rounded-xl p-3 shadow-sm`}>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${darkMode ? 'bg-[#4A3A1A]' : 'bg-[#FBC02D]/20'}`} />
            <span>{lang === 'ru' ? 'Есть уроки' : '有课'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-2 ring-red-500" />
            <span>{lang === 'ru' ? 'Сегодня' : '今天'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
