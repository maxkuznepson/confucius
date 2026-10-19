import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { TopAppBar } from '../components/TopAppBar';
import { getChildrenOfParent, mockUsers, mockGrades, mockAttendance, mockLessons, mockCourses, mockNotifications, mockPointsAccounts, mockPointsTransactions, mockTeachers, mockTeacherStudents } from '../data/mock';
import { User, BookOpen, Star, Calendar, Bell, Coins, Users, ChevronRight, MessageCircle } from 'lucide-react';

type ParentTab = 'children' | 'teachers' | 'courses' | 'shop' | 'cart' | 'events' | 'notifications' | 'points' | 'groups';

export function ParentPage({ parentId }: { parentId: string }) {
  const { lang, darkMode } = useApp();
  const [activeTab, setActiveTab] = useState<ParentTab>('children');

  const bgClass = darkMode ? 'bg-[#1A1410]' : 'bg-[#FFF3C4]';
  const textClass = darkMode ? 'text-[#F5E6D3]' : 'text-[#212121]';

  const tabs: { key: ParentTab; icon: React.ReactNode; label: string }[] = [
    { key: 'children', icon: <User size={16} />, label: t('myChild', lang) },
    { key: 'teachers', icon: <Users size={16} />, label: t('myTeachers', lang) },
    { key: 'courses', icon: <BookOpen size={16} />, label: t('parentCourses', lang) },
    { key: 'shop', icon: <BookOpen size={16} />, label: t('myShop', lang) },
    { key: 'cart', icon: <BookOpen size={16} />, label: t('myCart', lang) },
    { key: 'events', icon: <Calendar size={16} />, label: t('parentEvents', lang) },
    { key: 'notifications', icon: <Bell size={16} />, label: t('myNotifications', lang) },
    { key: 'points', icon: <Coins size={16} />, label: t('myPoints', lang) },
    { key: 'groups', icon: <Users size={16} />, label: t('myGroups', lang) },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
      <TopAppBar title={t('parent', lang)} showBack={false} showLogout={true} />

      {/* Tab Navigation */}
      <div className={`overflow-x-auto border-b ${darkMode ? 'border-[#4A3A1A]' : 'border-gray-200'}`}>
        <div className="flex min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-2.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
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
        {activeTab === 'children' && <ChildrenTab parentId={parentId} />}
        {activeTab === 'teachers' && <TeachersTab parentId={parentId} />}
        {activeTab === 'courses' && <ParentCoursesTab parentId={parentId} />}
        {activeTab === 'shop' && <ShopTab />}
        {activeTab === 'cart' && <CartTab />}
        {activeTab === 'events' && <ParentEventsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'points' && <PointsTab />}
        {activeTab === 'groups' && <GroupsTab />}
      </div>
    </div>
  );
}

// =================== CHILDREN TAB ===================
function ChildrenTab({ parentId }: { parentId: string }) {
  const { lang, darkMode, navigateTo } = useApp();
  const children = getChildrenOfParent(parentId);
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold opacity-80">{t('myChild', lang)}</h3>
      {children.length === 0 ? (
        <p className={`text-sm ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
          {lang === 'ru' ? 'Нет привязанных детей' : '暂无关联孩子'}
        </p>
      ) : (
        <div className="space-y-3">
          {children.map(child => {
            const user = mockUsers.find(u => u.id === child.user_id);
            const grades = mockGrades.filter(g => g.student_id === child.id);
            const attendance = mockAttendance.filter(a => a.student_id === child.id);
            const presentCount = attendance.filter(a => a.status === 'present').length;
            const avgGrade = grades.length > 0 ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : '—';

            return (
              <div
                key={child.id}
                onClick={() => navigateTo(`/child/${child.id}`)}
                className={`${cardBg} rounded-xl p-4 shadow-sm cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]'} text-white font-bold`}>
                      {user?.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user?.full_name}</p>
                      <p className="text-xs opacity-60">{child.student_no}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="opacity-40" />
                </div>

                {/* Quick stats */}
                <div className="flex gap-4 mt-3">
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold">{avgGrade}</p>
                    <p className="text-xs opacity-50">{lang === 'ru' ? 'Ср. оценка' : '平均分'}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold">{presentCount}/{attendance.length}</p>
                    <p className="text-xs opacity-50">{lang === 'ru' ? 'Посещаемость' : '出勤'}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold">{grades.length}</p>
                    <p className="text-xs opacity-50">{lang === 'ru' ? 'Оценок' : '成绩数'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contracts & Payments section */}
      <section className="mt-6">
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('contracts', lang)} / {t('payments', lang)}</h3>
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{lang === 'ru' ? 'Контракт на обучение' : '学习合同'}</p>
              <p className="text-xs opacity-60">2024-2025</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
              {lang === 'ru' ? 'Активен' : '有效'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs opacity-60">
            <span>{lang === 'ru' ? 'Оплачено' : '已付'}: 27 000 ₽</span>
            <span>{lang === 'ru' ? 'Остаток' : '余额'}: 0 ₽</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// =================== TEACHERS TAB ===================
function TeachersTab({ parentId }: { parentId: string }) {
  const { lang, darkMode } = useApp();
  const children = getChildrenOfParent(parentId);
  const childIds = children.map(c => c.id);

  // Find teachers for these children
  const teacherIds = new Set(
    mockTeacherStudents.filter(ts => childIds.includes(ts.student_id)).map(ts => ts.teacher_id)
  );
  const teachers = mockTeachers.filter(t => teacherIds.has(t.id));
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      {teachers.length === 0 ? (
        <p className={`text-sm ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
          {t('noTeachers', lang)}
        </p>
      ) : (
        <div className="space-y-3">
          {teachers.map(teacher => {
            const user = mockUsers.find(u => u.id === teacher.user_id);
            const subjects = mockTeacherStudents
              .filter(ts => ts.teacher_id === teacher.id && childIds.includes(ts.student_id))
              .map(ts => ts.subject);

            return (
              <div key={teacher.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]'} text-white font-bold`}>
                    {user?.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user?.full_name}</p>
                    <p className="text-xs opacity-60">{lang === 'ru' ? teacher.specialization : teacher.specialization_zh}</p>
                    <p className="text-xs opacity-50">{subjects.join(', ')}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} className={i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                  <span className="text-xs opacity-50 ml-1">4.0</span>
                </div>

                {/* Message button */}
                <button className={`mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg ${darkMode ? 'bg-[#4A3A1A] text-[#E8D9A0]' : 'bg-[#FBC02D] text-[#212121]'} font-medium`}>
                  <MessageCircle size={12} />
                  {t('sendMessage', lang)}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =================== PARENT COURSES TAB ===================
function ParentCoursesTab({ parentId }: { parentId: string }) {
  const { lang, darkMode } = useApp();
  const children = getChildrenOfParent(parentId);
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold opacity-80">{t('childSchedule', lang)}</h3>
      <div className="space-y-3">
        {mockCourses.filter(c => !c.is_additional).map(course => {
          const lessons = mockLessons.filter(l => l.course_id === course.id);
          return (
            <div key={course.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <p className="font-medium text-sm">{lang === 'ru' ? course.title : course.title_zh}</p>
              <div className="mt-2 space-y-1">
                {lessons.slice(0, 3).map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between text-xs opacity-70">
                    <span>{lang === 'ru' ? lesson.title : lesson.title_zh}</span>
                    <span>{lesson.room} • {new Date(lesson.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =================== SHOP TAB ===================
function ShopTab() {
  const { lang, darkMode } = useApp();
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  const products = [
    { id: 1, title: lang === 'ru' ? 'Курс "Продвинутый китайский"' : '高级汉语课程', price: 25000, category: lang === 'ru' ? 'Курсы' : '课程' },
    { id: 2, title: lang === 'ru' ? 'Учебник HSK 3' : 'HSK 3 教材', price: 1500, category: lang === 'ru' ? 'Учебники' : '教材' },
    { id: 3, title: lang === 'ru' ? 'Образовательная поездка в Пекин' : '北京教育之旅', price: 120000, category: lang === 'ru' ? 'Поездки' : '旅行' },
    { id: 4, title: lang === 'ru' ? 'Набор для каллиграфии' : '书法套装', price: 3500, category: lang === 'ru' ? 'Сувениры' : '纪念品' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold opacity-80">{t('myShop', lang)}</h3>
      <div className="space-y-3">
        {products.map(product => (
          <div key={product.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{product.title}</p>
                <p className="text-xs opacity-50">{product.category}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{product.price.toLocaleString()} ₽</p>
                <button className={`mt-1 text-xs px-3 py-1 rounded-lg ${darkMode ? 'bg-[#E53935]' : 'bg-[#D32F2F]'} text-white font-medium`}>
                  {lang === 'ru' ? 'В корзину' : '加入购物车'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== CART TAB ===================
function CartTab() {
  const { lang, darkMode } = useApp();
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold opacity-80">{t('myCart', lang)}</h3>
      <div className={`${cardBg} rounded-xl p-6 shadow-sm text-center`}>
        <div className="text-4xl mb-3">🛒</div>
        <p className={`text-sm ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
          {lang === 'ru' ? 'Корзина пуста' : '购物车为空'}
        </p>
      </div>
    </div>
  );
}

// =================== PARENT EVENTS TAB ===================
function ParentEventsTab() {
  const { lang, darkMode } = useApp();
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  const events = [
    { id: 1, title: lang === 'ru' ? 'День открытых дверей' : '开放日', date: '2025-02-20', status: 'open' },
    { id: 2, title: lang === 'ru' ? 'Праздник весны' : '春节庆典', date: '2025-01-29', status: 'open' },
    { id: 3, title: lang === 'ru' ? 'Родительское собрание' : '家长会', date: '2025-01-15', status: 'completed' },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className={`${cardBg} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{event.title}</p>
                <p className="text-xs opacity-60">📅 {event.date}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                event.status === 'open' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}>
                {event.status === 'open' ? t('open', lang) : t('closed', lang)}
              </span>
            </div>
            {event.status === 'open' && (
              <button className={`mt-2 text-xs px-3 py-1.5 rounded-lg ${darkMode ? 'bg-[#E53935]' : 'bg-[#D32F2F]'} text-white font-medium`}>
                {t('registration', lang)}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== NOTIFICATIONS TAB ===================
function NotificationsTab() {
  const { lang, darkMode } = useApp();
  const { auth } = useApp();
  const userId = auth.user?.id || '';
  const notifications = mockNotifications.filter(n => n.user_id === userId || n.user_id === 'u-parent-1');
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <p className={`text-sm text-center py-8 ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
          {t('noNotifications', lang)}
        </p>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div key={notif.id} className={`${cardBg} rounded-xl p-3 shadow-sm ${!notif.is_read ? (darkMode ? 'border-l-4 border-[#E53935]' : 'border-l-4 border-[#D32F2F]') : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{lang === 'ru' ? notif.title : notif.title_zh}</p>
                  <p className="text-xs opacity-60 mt-0.5">{lang === 'ru' ? notif.body : notif.body_zh}</p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-xs opacity-40 mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== POINTS TAB ===================
function PointsTab() {
  const { lang, darkMode } = useApp();
  const pointsAccount = mockPointsAccounts[0];
  const transactions = mockPointsTransactions;
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className={`${darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]'} rounded-xl p-5 text-white shadow-md`}>
        <p className="text-sm opacity-80">{t('balance', lang)}</p>
        <p className="text-3xl font-bold mt-1">{pointsAccount.balance.toLocaleString()}</p>
        <p className="text-xs opacity-70 mt-1">{t('earned', lang)}: {pointsAccount.total_earned.toLocaleString()} {t('points', lang)}</p>

        {/* Progress to trip */}
        <div className="mt-4">
          <div className="flex justify-between text-xs opacity-70 mb-1">
            <span>{lang === 'ru' ? 'До поездки' : '距旅行'}</span>
            <span>{((pointsAccount.balance / 1200000) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="h-2 rounded-full bg-white" style={{ width: `${Math.min((pointsAccount.balance / 1200000) * 100, 100)}%` }} />
          </div>
          <p className="text-xs opacity-60 mt-1">1 200 000 {t('points', lang)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${darkMode ? 'bg-[#4A3A1A] text-[#E8D9A0]' : 'bg-[#FBC02D] text-[#212121]'}`}>
          {t('transferPoints', lang)}
        </button>
        <button className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${darkMode ? 'bg-[#E53935]' : 'bg-[#D32F2F]'} text-white`}>
          {t('exchange', lang)}
        </button>
      </div>

      {/* Transaction history */}
      <section>
        <h3 className="text-sm font-bold mb-2 opacity-80">{t('operations', lang)}</h3>
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className={`${cardBg} rounded-xl p-3 shadow-sm flex items-center justify-between`}>
              <div>
                <p className="text-sm font-medium">{lang === 'ru' ? tx.description : tx.description_zh}</p>
                <p className="text-xs opacity-50">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
              <p className="font-bold text-green-500">+{tx.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// =================== GROUPS TAB ===================
function GroupsTab() {
  const { lang, darkMode } = useApp();
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  const groups = [
    { id: 1, name: lang === 'ru' ? 'Родители класса А-1' : 'A-1班家长群', members: 15, unread: 3 },
    { id: 2, name: lang === 'ru' ? 'Школьный родительский комитет' : '学校家长委员会', members: 25, unread: 0 },
  ];

  return (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <p className={`text-sm text-center py-8 ${darkMode ? 'text-[#E8D9A0]/50' : 'text-gray-400'}`}>
          {t('noGroups', lang)}
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <div key={group.id} className={`${cardBg} rounded-xl p-4 shadow-sm flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-[#4A3A1A]' : 'bg-[#FBC02D]'}`}>
                  <Users size={18} className={darkMode ? 'text-[#E8D9A0]' : 'text-[#212121]'} />
                </div>
                <div>
                  <p className="font-medium text-sm">{group.name}</p>
                  <p className="text-xs opacity-50">{group.members} {lang === 'ru' ? 'участников' : '成员'}</p>
                </div>
              </div>
              {group.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {group.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
