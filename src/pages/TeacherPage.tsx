import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { TopAppBar } from '../components/TopAppBar';
import { mockStudents, mockUsers, mockAttendance, mockLessons, mockGrades, mockTeacherStudents, mockCourses } from '../data/mock';
import { Users, Star, ClipboardList, GraduationCap, Calendar } from 'lucide-react';
import { TeacherSchedule } from './TeacherSchedule';

type TeacherTab = 'attendance' | 'grades' | 'exams' | 'students' | 'schedule';

export function TeacherPage({ teacherId }: { teacherId: string }) {
  const { lang, darkMode } = useApp();
  const [activeTab, setActiveTab] = useState<TeacherTab>('attendance');

  const bgClass = darkMode ? 'bg-[#1A1410]' : 'bg-[#FFF3C4]';
  const textClass = darkMode ? 'text-[#F5E6D3]' : 'text-[#212121]';

  const tabs: { key: TeacherTab; icon: React.ReactNode; label: string }[] = [
    { key: 'attendance', icon: <ClipboardList size={16} />, label: t('attendance', lang) },
    { key: 'grades', icon: <Star size={16} />, label: t('gradeStudents', lang) },
    { key: 'exams', icon: <GraduationCap size={16} />, label: t('manageExams', lang) },
    { key: 'students', icon: <Users size={16} />, label: t('studentManagement', lang) },
    { key: 'schedule', icon: <Calendar size={16} />, label: t('schedule', lang) },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
      <TopAppBar title={t('teacher', lang)} showBack={false} showLogout={true} />

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
        {activeTab === 'attendance' && <AttendanceTab teacherId={teacherId} />}
        {activeTab === 'grades' && <GradesTab teacherId={teacherId} />}
        {activeTab === 'exams' && <ExamsTab />}
        {activeTab === 'students' && <StudentsTab teacherId={teacherId} />}
        {activeTab === 'schedule' && <TeacherSchedule teacherId={teacherId} />}
      </div>
    </div>
  );
}

// =================== ATTENDANCE TAB ===================
function AttendanceTab({ teacherId }: { teacherId: string }) {
  const { lang, darkMode } = useApp();
  const teacher = mockTeacherStudents.find(ts => ts.teacher_id === teacherId);
  const studentIds = mockTeacherStudents.filter(ts => ts.teacher_id === teacherId).map(ts => ts.student_id);
  const students = mockStudents.filter(s => studentIds.includes(s.id));
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  const [selectedLesson, setSelectedLesson] = useState(mockLessons[0]?.id || '');
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'late' | 'absent' | 'excused'>>({});

  const lessons = mockLessons.filter(l => {
    const course = mockCourses.find(c => c.id === l.course_id);
    return course?.subject === teacher?.subject;
  });

  const handleMarkAttendance = (studentId: string, status: 'present' | 'late' | 'absent' | 'excused') => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  return (
    <div className="space-y-4">
      {/* Lesson selector */}
      <div>
        <label className={`text-sm font-medium mb-1 block ${darkMode ? 'text-[#E8D9A0]' : 'text-gray-700'}`}>
          {lang === 'ru' ? 'Выберите урок' : '选择课程'}
        </label>
        <select
          value={selectedLesson}
          onChange={(e) => setSelectedLesson(e.target.value)}
          className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? 'bg-[#2A2018] border-[#4A3A1A] text-[#E8D9A0]' : 'bg-white border-gray-300'}`}
        >
          {lessons.map(l => (
            <option key={l.id} value={l.id}>{lang === 'ru' ? l.title : l.title_zh}</option>
          ))}
        </select>
      </div>

      {/* Student list */}
      <div className="space-y-2">
        {students.map(student => {
          const user = mockUsers.find(u => u.id === student.user_id);
          const existingAttendance = mockAttendance.find(a => a.student_id === student.id && a.lesson_id === selectedLesson);
          const currentStatus = attendanceState[student.id] || existingAttendance?.status || '';

          return (
            <div key={student.id} className={`${cardBg} rounded-xl p-3 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]'} text-white`}>
                    {user?.full_name.charAt(0)}
                  </div>
                  <p className="text-sm font-medium">{user?.full_name}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                {(['present', 'late', 'absent', 'excused'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => handleMarkAttendance(student.id, status)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentStatus === status
                        ? status === 'present' ? 'bg-green-500 text-white' :
                          status === 'late' ? 'bg-yellow-500 text-white' :
                          status === 'absent' ? 'bg-red-500 text-white' :
                          'bg-blue-500 text-white'
                        : darkMode ? 'bg-[#4A3A1A] text-[#E8D9A0]' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {status === 'present' ? '✓' : status === 'late' ? '⏰' : status === 'absent' ? '✗' : '—'}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <button className={`w-full py-3 rounded-xl ${darkMode ? 'bg-[#E53935]' : 'bg-[#D32F2F]'} text-white font-bold shadow-md`}>
        {lang === 'ru' ? 'Сохранить посещаемость' : '保存出勤'}
      </button>
    </div>
  );
}

// =================== GRADES TAB ===================
function GradesTab({ teacherId }: { teacherId: string }) {
  const { lang, darkMode } = useApp();
  const studentIds = mockTeacherStudents.filter(ts => ts.teacher_id === teacherId).map(ts => ts.student_id);
  const students = mockStudents.filter(s => studentIds.includes(s.id));
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>({});

  const dimensions = [
    { key: 'reading', label: t('reading', lang) },
    { key: 'writing', label: t('writing', lang) },
    { key: 'speaking', label: t('speaking', lang) },
    { key: 'discipline', label: t('discipline', lang) },
    { key: 'interaction', label: t('interaction', lang) },
  ];

  const handleRate = (studentId: string, dimension: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [dimension]: value }
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold opacity-80">{t('gradeStudents', lang)}</h3>

      {students.map(student => {
        const user = mockUsers.find(u => u.id === student.user_id);
        const studentRatings = ratings[student.id] || {};

        return (
          <div key={student.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]'} text-white`}>
                {user?.full_name.charAt(0)}
              </div>
              <p className="font-medium text-sm">{user?.full_name}</p>
            </div>

            {/* Multi-dimensional rating */}
            <div className="space-y-2">
              {dimensions.map(dim => (
                <div key={dim.key} className="flex items-center justify-between">
                  <span className="text-xs opacity-70 w-24">{dim.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        onClick={() => handleRate(student.id, dim.key, val)}
                        className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                          (studentRatings[dim.key] || 0) >= val
                            ? 'bg-yellow-400 text-white'
                            : darkMode ? 'bg-[#4A3A1A] text-[#E8D9A0]/50' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Comment */}
            <textarea
              placeholder={t('addReview', lang)}
              className={`w-full mt-3 px-3 py-2 rounded-lg border text-xs resize-none h-16 ${darkMode ? 'bg-[#1A1410] border-[#4A3A1A] text-[#E8D9A0]' : 'bg-gray-50 border-gray-200'}`}
            />
          </div>
        );
      })}

      <button className={`w-full py-3 rounded-xl ${darkMode ? 'bg-[#E53935]' : 'bg-[#D32F2F]'} text-white font-bold shadow-md`}>
        {lang === 'ru' ? 'Сохранить оценки' : '保存评分'}
      </button>
    </div>
  );
}

// =================== EXAMS TAB ===================
function ExamsTab() {
  const { lang, darkMode } = useApp();
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  const examTypes = [
    { key: 'monthly', label: t('monthlyExam', lang), icon: '📝' },
    { key: 'semester', label: t('semesterExam', lang), icon: '📋' },
    { key: 'yct', label: t('yctExam', lang), icon: '🎓' },
    { key: 'hsk', label: t('hskExam', lang), icon: '🏆' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold opacity-80">{t('manageExams', lang)}</h3>

      <div className="grid grid-cols-2 gap-3">
        {examTypes.map(exam => (
          <div key={exam.key} className={`${cardBg} rounded-xl p-4 shadow-sm text-center cursor-pointer hover:opacity-90 transition-opacity`}>
            <div className="text-2xl mb-2">{exam.icon}</div>
            <p className="text-xs font-medium">{exam.label}</p>
          </div>
        ))}
      </div>

      {/* Recent exam results */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{lang === 'ru' ? 'Последние результаты' : '最近成绩'}</h3>
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <div className="space-y-2">
            {[
              { student: 'Иванов Иван', score: 85, max: 100 },
              { student: 'Иванова Анна', score: 92, max: 100 },
            ].map((result, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{result.student}</span>
                <span className="font-bold text-sm">{result.score}/{result.max}</span>
              </div>
            ))}
          </div>
          <button className={`w-full mt-3 py-2 rounded-lg text-xs font-medium ${darkMode ? 'bg-[#4A3A1A] text-[#E8D9A0]' : 'bg-[#FBC02D] text-[#212121]'}`}>
            {t('publishGrades', lang)}
          </button>
        </div>
      </section>
    </div>
  );
}

// =================== STUDENTS TAB ===================
function StudentsTab({ teacherId }: { teacherId: string }) {
  const { lang, darkMode } = useApp();
  const studentIds = mockTeacherStudents.filter(ts => ts.teacher_id === teacherId).map(ts => ts.student_id);
  const students = mockStudents.filter(s => studentIds.includes(s.id));
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold opacity-80">{t('studentManagement', lang)}</h3>

      <div className="space-y-3">
        {students.map(student => {
          const user = mockUsers.find(u => u.id === student.user_id);
          const grades = mockGrades.filter(g => g.student_id === student.id);
          const attendance = mockAttendance.filter(a => a.student_id === student.id);
          const avgGrade = grades.length > 0 ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : '—';
          const attendRate = attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0;

          return (
            <div key={student.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]'} text-white`}>
                  {user?.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user?.full_name}</p>
                  <p className="text-xs opacity-60">{student.student_no} • {user?.full_name_zh}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${student.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {student.status === 'active' ? (lang === 'ru' ? 'Активен' : '活跃') : (lang === 'ru' ? 'Неактивен' : '不活跃')}
                </span>
              </div>

              {/* Stats */}
              <div className="flex gap-3">
                <div className={`flex-1 text-center p-2 rounded-lg ${darkMode ? 'bg-[#2A2018]' : 'bg-gray-100'}`}>
                  <p className="text-sm font-bold">{avgGrade}</p>
                  <p className="text-[10px] opacity-50">{lang === 'ru' ? 'Ср. балл' : '平均分'}</p>
                </div>
                <div className={`flex-1 text-center p-2 rounded-lg ${darkMode ? 'bg-[#2A2018]' : 'bg-gray-100'}`}>
                  <p className="text-sm font-bold">{attendRate}%</p>
                  <p className="text-[10px] opacity-50">{lang === 'ru' ? 'Посещ.' : '出勤率'}</p>
                </div>
                <div className={`flex-1 text-center p-2 rounded-lg ${darkMode ? 'bg-[#2A2018]' : 'bg-gray-100'}`}>
                  <p className="text-sm font-bold">{grades.length}</p>
                  <p className="text-[10px] opacity-50">{lang === 'ru' ? 'Оценок' : '成绩'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
