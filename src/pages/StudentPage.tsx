import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { TopAppBar } from '../components/TopAppBar';
import { mockCourses, mockLessons, mockHomeworks, mockSubmissions, mockGrades, mockLessonRatings, mockAchievements, mockContests, mockEvents, mockAttendance, mockStudents, mockCourseEnrollments } from '../data/mock';
import { BookOpen, ClipboardList, Star, GraduationCap, Trophy, Calendar, Award, ChevronRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

type StudentTab = 'learning' | 'homework' | 'grades' | 'courses' | 'contests' | 'events' | 'achievements';

export function StudentPage({ studentId }: { studentId: string }) {
  const { lang, darkMode, canGoBack } = useApp();
  const [activeTab, setActiveTab] = useState<StudentTab>('learning');

  const bgClass = darkMode ? 'bg-[#1A1410]' : 'bg-[#FFF3C4]';
  const textClass = darkMode ? 'text-[#F5E6D3]' : 'text-[#212121]';

  const tabs: { key: StudentTab; icon: React.ReactNode; label: string }[] = [
    { key: 'learning', icon: <BookOpen size={18} />, label: t('myLearning', lang) },
    { key: 'homework', icon: <ClipboardList size={18} />, label: t('myHomework', lang) },
    { key: 'grades', icon: <Star size={18} />, label: t('myGrades', lang) },
    { key: 'courses', icon: <GraduationCap size={18} />, label: t('myCourses', lang) },
    { key: 'contests', icon: <Trophy size={18} />, label: t('myContests', lang) },
    { key: 'events', icon: <Calendar size={18} />, label: t('myEvents', lang) },
    { key: 'achievements', icon: <Award size={18} />, label: t('myAchievements', lang) },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
      <TopAppBar title={t('student', lang)} showBack={canGoBack} showLogout={true} />

      {/* Tab Navigation */}
      <div className={`overflow-x-auto border-b ${darkMode ? 'border-[#4A3A1A]' : 'border-gray-200'}`}>
        <div className="flex min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? darkMode ? 'text-[#E53935] border-b-2 border-[#E53935]' : 'text-[#D32F2F] border-b-2 border-[#D32F2F]'
                  : darkMode ? 'text-[#E8D9A0]/60' : 'text-gray-500'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-6">
        {activeTab === 'learning' && <LearningTab studentId={studentId} />}
        {activeTab === 'homework' && <HomeworkTab studentId={studentId} />}
        {activeTab === 'grades' && <GradesTab studentId={studentId} />}
        {activeTab === 'courses' && <CoursesTab studentId={studentId} />}
        {activeTab === 'contests' && <ContestsTab />}
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'achievements' && <AchievementsTab studentId={studentId} />}
      </div>
    </div>
  );
}

// =================== LEARNING TAB ===================
function LearningTab({ studentId }: { studentId: string }) {
  const { lang, darkMode } = useApp();
  const lessonsContainerRef = React.useRef<HTMLDivElement>(null);
  const currentLessonRef = React.useRef<HTMLDivElement>(null);
  
  // Получаем информацию о студенте
  const student = mockStudents.find(s => s.id === studentId);
  const studentClassId = student?.class_id;
  
  // Курсы, на которые записан студент
  const enrolledCourseIds = mockCourseEnrollments
    .filter(e => e.student_id === studentId)
    .map(e => e.course_id);
  
  const enrolledCourses = mockCourses.filter(c => 
    !c.is_additional && enrolledCourseIds.includes(c.id)
  );
  const additionalCourses = mockCourses.filter(c => 
    c.is_additional && enrolledCourseIds.includes(c.id)
  );
  
  // Уроки только для курсов и класса студента
  const studentLessons = mockLessons.filter(l => 
    enrolledCourseIds.includes(l.course_id) && 
    l.class_id === studentClassId
  );
  
  // Используем реальную текущую дату для определения "сегодня"
  const today = new Date();
  
  // Уроки на сегодня (реальная дата)
  const todayLessons = studentLessons.filter(l => {
    const d = new Date(l.scheduled_at);
    return d.toDateString() === today.toDateString();
  });
  
  // Все уроки студента, отсортированные по дате
  const allLessons = [...studentLessons].sort((a, b) => 
    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );
  
  // Автоматическая прокрутка к текущему или ближайшему будущему уроку
  React.useEffect(() => {
    // Находим первый будущий или текущий урок
    const targetLesson = allLessons.find(l => 
      l.live_status === 'live' || l.live_status === 'upcoming'
    );
    
    if (targetLesson && currentLessonRef.current) {
      setTimeout(() => {
        currentLessonRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [allLessons]);

  const pendingHw = mockHomeworks.filter(hw => {
    const sub = mockSubmissions.find(s => s.homework_id === hw.id && s.student_id === studentId);
    return !sub || sub.status === 'pending';
  });

  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';
  const goldBg = darkMode ? 'bg-[#4A3A1A]' : 'bg-[#FBC02D]';
  const goldText = darkMode ? 'text-[#E8D9A0]' : 'text-[#212121]';
  const pastBg = darkMode ? 'bg-[#1A1410]/50' : 'bg-gray-100';
  const pastText = darkMode ? 'text-[#E8D9A0]/40' : 'text-gray-400';

  return (
    <div className="space-y-4">
      {/* Today's lessons */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('today', lang)}</h3>
        {todayLessons.length === 0 ? (
          <p className={`text-sm ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
            {lang === 'ru' ? 'Нет занятий сегодня' : '今天没有课程'}
          </p>
        ) : (
          <div className="space-y-2">
            {todayLessons.map(lesson => (
              <div key={lesson.id} className={`${goldBg} ${goldText} rounded-xl p-3 flex items-center justify-between`}>
                <div>
                  <p className="font-medium text-sm">{lang === 'ru' ? lesson.title : lesson.title_zh}</p>
                  <p className="text-xs opacity-70">{lesson.room} • {new Date(lesson.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  lesson.live_status === 'live' ? 'bg-red-500 text-white' :
                  lesson.live_status === 'upcoming' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {t(lesson.live_status, lang)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Weekly Schedule */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('schedule', lang)}</h3>
        <div ref={lessonsContainerRef} className="space-y-2 max-h-96 overflow-y-auto">
          {allLessons.map(lesson => {
            const lessonDate = new Date(lesson.scheduled_at);
            const isPast = lesson.live_status === 'finished';
            const isCurrent = lesson.live_status === 'live';
            const isFuture = lesson.live_status === 'upcoming';
            
            // Определяем, является ли это текущим или ближайшим будущим уроком для прокрутки
            const isFirstTargetLesson = (isCurrent || isFuture) && 
              !allLessons.slice(0, allLessons.indexOf(lesson)).some(l => l.live_status === 'live' || l.live_status === 'upcoming');
            
            return (
              <div 
                key={lesson.id}
                ref={isFirstTargetLesson ? currentLessonRef : null}
                className={`${
                  isPast ? `${pastBg} ${pastText}` : 
                  isCurrent ? `${goldBg} ${goldText}` :
                  `${cardBg} ${darkMode ? 'text-[#F5E6D3]' : 'text-[#212121]'}`
                } rounded-xl p-3 flex items-center justify-between transition-colors`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${isPast ? 'font-normal' : 'font-medium'}`}>
                      {lang === 'ru' ? lesson.title : lesson.title_zh}
                    </p>
                    {isPast && <span className="text-xs opacity-50">✓</span>}
                  </div>
                  <p className={`text-xs ${isPast ? 'opacity-50' : 'opacity-70'}`}>
                    {lessonDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'zh-CN', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })} • {lessonDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {lesson.room && ` • ${lesson.room}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  isCurrent ? 'bg-red-500 text-white' :
                  isFuture ? 'bg-green-500 text-white' : 
                  'bg-gray-400 text-white'
                }`}>
                  {t(lesson.live_status, lang)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Courses */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('courses', lang)}</h3>
        <div className="space-y-2">
          {enrolledCourses.map(course => (
            <div key={course.id} className={`${cardBg} rounded-xl p-3 flex items-center justify-between shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]'} text-white`}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm">{lang === 'ru' ? course.title : course.title_zh}</p>
                  <p className="text-xs opacity-60">{course.subject}</p>
                </div>
              </div>
              <ChevronRight size={16} className="opacity-40" />
            </div>
          ))}
        </div>
      </section>

      {/* Additional Activities */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('additional', lang)}</h3>
        <div className="space-y-2">
          {additionalCourses.map(course => (
            <div key={course.id} className={`${cardBg} rounded-xl p-3 flex items-center justify-between shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-[#4A3A1A]' : 'bg-[#FBC02D]'} ${darkMode ? 'text-[#E8D9A0]' : 'text-[#212121]'}`}>
                  <Star size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm">{lang === 'ru' ? course.title : course.title_zh}</p>
                  <p className="text-xs opacity-60">{lang === 'ru' ? 'Доп. занятие' : '额外课程'}</p>
                </div>
              </div>
              <ChevronRight size={16} className="opacity-40" />
            </div>
          ))}
        </div>
      </section>

      {/* Pending Homework */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('reminders', lang)}</h3>
        {pendingHw.length === 0 ? (
          <p className={`text-sm ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
            {lang === 'ru' ? 'Нет невыполненных заданий' : '没有未完成的作业'}
          </p>
        ) : (
          <div className="space-y-2">
            {pendingHw.map(hw => (
              <div key={hw.id} className={`${cardBg} rounded-xl p-3 shadow-sm border-l-4 ${darkMode ? 'border-[#E53935]' : 'border-[#D32F2F]'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{lang === 'ru' ? hw.title : hw.title_zh}</p>
                  <Clock size={14} className="opacity-50" />
                </div>
                <p className="text-xs opacity-60 mt-1">
                  {t('deadline', lang)}: {new Date(hw.deadline_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// =================== HOMEWORK TAB ===================
function HomeworkTab({ studentId }: { studentId: string }) {
  const { lang, darkMode } = useApp();
  const [filter, setFilter] = useState<'pending' | 'completed' | 'overdue'>('pending');

  const submissions = mockSubmissions.filter(s => s.student_id === studentId);

  const getHomeworkForFilter = () => {
    return mockHomeworks.map(hw => {
      const sub = submissions.find(s => s.homework_id === hw.id);
      return { hw, sub };
    }).filter(({ hw, sub }) => {
      if (filter === 'pending') return !sub || sub.status === 'pending';
      if (filter === 'completed') return sub?.status === 'graded' || sub?.status === 'submitted';
      if (filter === 'overdue') return sub?.status === 'overdue' || (!sub && new Date() > new Date(hw.deadline_at));
      return true;
    });
  };

  const items = getHomeworkForFilter();
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['pending', 'completed', 'overdue'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? darkMode ? 'bg-[#E53935] text-white' : 'bg-[#D32F2F] text-white'
                : darkMode ? 'bg-[#2A2018] text-[#E8D9A0]' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t(f, lang)}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className={`text-sm ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
            {t('noHomework', lang)}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(({ hw, sub }) => (
            <div key={hw.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{lang === 'ru' ? hw.title : hw.title_zh}</p>
                  <p className="text-xs opacity-60 mt-1">{hw.description}</p>
                </div>
                {sub?.status === 'overdue' && <AlertTriangle size={16} className="text-red-500" />}
                {sub?.status === 'graded' && <CheckCircle size={16} className="text-green-500" />}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs opacity-70">
                <span>{t('deadline', lang)}: {new Date(hw.deadline_at).toLocaleDateString()}</span>
                {sub?.score !== undefined && (
                  <span>{t('score', lang)}: {sub.score}/{hw.max_score}</span>
                )}
                {sub?.correctness !== undefined && (
                  <span>{t('correctness', lang)}: {sub.correctness}%</span>
                )}
              </div>
              {sub?.status === 'graded' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${(sub.correctness || 0) >= 70 ? 'bg-green-500' : (sub.correctness || 0) >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${sub.correctness || 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== GRADES TAB ===================
function GradesTab({ studentId }: { studentId: string }) {
  const { lang, darkMode } = useApp();
  const [filter, setFilter] = useState<'all' | 'lesson' | 'monthly' | 'semester' | 'certification'>('all');

  const studentGrades = mockGrades.filter(g => g.student_id === studentId);
  const ratings = mockLessonRatings.filter(r => r.student_id === studentId);
  const filtered = filter === 'all' ? studentGrades : studentGrades.filter(g => g.grade_type === filter || (filter === 'certification' && (g.grade_type === 'yct' || g.grade_type === 'hsk')));

  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      {/* Star ratings summary */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('starRating', lang)}</h3>
        <div className="space-y-2">
          {ratings.map(r => (
            <div key={r.id} className={`${cardBg} rounded-xl p-3 shadow-sm flex items-center justify-between`}>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} className={i <= r.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-xs opacity-60 mt-1">{r.comment}</p>
              </div>
              <span className="text-xs opacity-50">{new Date(r.rated_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'lesson', 'monthly', 'semester', 'certification'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? darkMode ? 'bg-[#E53935] text-white' : 'bg-[#D32F2F] text-white'
                : darkMode ? 'bg-[#2A2018] text-[#E8D9A0]' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {f === 'all' ? (lang === 'ru' ? 'Все' : '全部') : t(f === 'certification' ? 'certification' : f, lang)}
          </button>
        ))}
      </div>

      {/* Grades list */}
      <div className="space-y-2">
        {filtered.map(g => (
          <div key={g.id} className={`${cardBg} rounded-xl p-3 shadow-sm flex items-center justify-between`}>
            <div>
              <p className="font-medium text-sm">{g.subject}</p>
              <p className="text-xs opacity-60">{g.period_label}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{g.score}</p>
              <p className="text-xs opacity-50">/ {g.max_score}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Class ranking */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('classRank', lang)}</h3>
        <div className={`${cardBg} rounded-xl p-4 shadow-sm text-center`}>
          <p className="text-3xl font-bold" style={{ color: darkMode ? '#E53935' : '#D32F2F' }}>#3</p>
          <p className="text-xs opacity-60 mt-1">{lang === 'ru' ? 'из 15 учеников' : '共15名学生'}</p>
        </div>
      </section>

      {/* Dynamics chart placeholder */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('dynamics', lang)}</h3>
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <div className="flex items-end justify-between h-24 gap-1">
            {[3.5, 4.0, 3.8, 4.2, 4.5, 4.3].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${darkMode ? 'bg-[#4A3A1A]' : 'bg-[#FBC02D]'}`}
                  style={{ height: `${(val / 5) * 100}%` }}
                />
                <span className="text-[10px] opacity-50">{val}</span>
              </div>
            ))}
          </div>
          <p className="text-xs opacity-50 text-center mt-2">
            {lang === 'ru' ? 'Последние 6 месяцев' : '最近6个月'}
          </p>
        </div>
      </section>
    </div>
  );
}

// =================== COURSES TAB ===================
function CoursesTab({ studentId: _studentId }: { studentId: string }) {
  const { lang, darkMode } = useApp();
  const liveCourses = mockCourses.filter(c => c.course_type === 'live');
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold opacity-80">{lang === 'ru' ? 'Онлайн-курсы' : '直播课程'}</h3>
      <div className="space-y-3">
        {liveCourses.map(course => {
          const lessons = mockLessons.filter(l => l.course_id === course.id);
          const currentLesson = lessons.find(l => l.live_status === 'live') || lessons.find(l => l.live_status === 'upcoming');

          return (
            <div key={course.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{lang === 'ru' ? course.title : course.title_zh}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentLesson?.live_status === 'live' ? 'bg-red-500 text-white' :
                  currentLesson?.live_status === 'upcoming' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {currentLesson?.live_status === 'live' ? t('live', lang) :
                   currentLesson?.live_status === 'upcoming' ? t('upcoming', lang) : t('finished', lang)}
                </span>
              </div>
              {currentLesson && (
                <p className="text-xs opacity-60">
                  {lang === 'ru' ? currentLesson.title : currentLesson.title_zh} • {currentLesson.room}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =================== CONTESTS TAB ===================
function ContestsTab() {
  const { lang, darkMode } = useApp();
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      {mockContests.length === 0 ? (
        <p className={`text-sm text-center py-8 ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
          {t('noContests', lang)}
        </p>
      ) : (
        <div className="space-y-3">
          {mockContests.map(contest => (
            <div key={contest.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{lang === 'ru' ? contest.title : contest.title_zh}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  contest.status === 'open' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {t(contest.status, lang)}
                </span>
              </div>
              <p className="text-xs opacity-60 mb-2">{lang === 'ru' ? contest.description : contest.description_zh}</p>
              <div className="flex items-center gap-3 text-xs opacity-50">
                <span>{t('dates', lang)}: {contest.start_date} — {contest.end_date}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className={`text-xs px-3 py-1.5 rounded-lg ${darkMode ? 'bg-[#4A3A1A] text-[#E8D9A0]' : 'bg-[#FBC02D] text-[#212121]'} font-medium`}>
                  {t('rules', lang)}
                </button>
                {contest.status === 'open' && (
                  <button className={`text-xs px-3 py-1.5 rounded-lg ${darkMode ? 'bg-[#E53935]' : 'bg-[#D32F2F]'} text-white font-medium`}>
                    {t('registration', lang)}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== EVENTS TAB ===================
function EventsTab() {
  const { lang, darkMode } = useApp();
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      {mockEvents.length === 0 ? (
        <p className={`text-sm text-center py-8 ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
          {t('noEvents', lang)}
        </p>
      ) : (
        <div className="space-y-3">
          {mockEvents.map(event => (
            <div key={event.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{lang === 'ru' ? event.title : event.title_zh}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  event.status === 'open' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {t(event.status, lang)}
                </span>
              </div>
              <p className="text-xs opacity-60 mb-2">{lang === 'ru' ? event.description : event.description_zh}</p>
              <div className="flex items-center gap-3 text-xs opacity-50">
                <span>📍 {event.location}</span>
                <span>📅 {new Date(event.start_at).toLocaleDateString()}</span>
              </div>
              {event.is_paid && (
                <p className="text-xs mt-1 opacity-60">💰 {event.price} ₽</p>
              )}
              {event.status === 'open' && (
                <button className={`mt-3 text-xs px-3 py-1.5 rounded-lg ${darkMode ? 'bg-[#E53935]' : 'bg-[#D32F2F]'} text-white font-medium`}>
                  {t('registration', lang)}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== ACHIEVEMENTS TAB ===================
function AchievementsTab({ studentId }: { studentId: string }) {
  const { lang, darkMode } = useApp();
  const [filter, setFilter] = useState<'all' | 'class' | 'school' | 'external'>('all');

  const achievements = mockAchievements.filter(a => a.student_id === studentId);
  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter);
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'class', 'school', 'external'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? darkMode ? 'bg-[#E53935] text-white' : 'bg-[#D32F2F] text-white'
                : darkMode ? 'bg-[#2A2018] text-[#E8D9A0]' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {f === 'all' ? (lang === 'ru' ? 'Все' : '全部') : t(f === 'class' ? 'classAwards' : f === 'school' ? 'schoolAwards' : 'externalAwards', lang)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className={`text-sm text-center py-8 ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
          {t('noAchievements', lang)}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.sort((a, b) => new Date(b.issued_date).getTime() - new Date(a.issued_date).getTime()).map(ach => (
            <div key={ach.id} className={`${cardBg} rounded-xl p-4 shadow-sm flex items-start gap-3`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                ach.category === 'class' ? (darkMode ? 'bg-[#4A3A1A]' : 'bg-[#FBC02D]') :
                ach.category === 'school' ? (darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]') :
                (darkMode ? 'bg-[#2A2018] border border-[#4A3A1A]' : 'bg-gray-100 border border-gray-200')
              }`}>
                <Award size={20} className={ach.category === 'school' ? 'text-white' : darkMode ? 'text-[#E8D9A0]' : 'text-[#212121]'} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{lang === 'ru' ? ach.title : ach.title_zh}</p>
                <p className="text-xs opacity-60 mt-0.5">{ach.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs opacity-50">
                  <span>{ach.issuer}</span>
                  <span>•</span>
                  <span>{new Date(ach.issued_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
