# 📅 Расписание уроков для учителей

## 🎯 Описание

Добавлена новая вкладка **"Расписание"** в рабочее место учителя с интерактивным календарём на текущий год.

## ✨ Функциональность

### Календарь
- ✅ Отображение только текущего года
- ✅ По умолчанию показывается текущий месяц
- ✅ Горизонтальный заголовок: **пн, вт, ср, чт, пт, сб, вс**
- ✅ Выходные дни (сб, вс) выделены красным цветом
- ✅ Сегодняшний день обведён красной рамкой

### Интерактивность
- ✅ Дни с уроками **подчёркнуты** и кликабельны
- ✅ Под каждым числом показано количество уроков
- ✅ При клике на день открывается список уроков
- ✅ Кнопка "Назад" для возврата к календарю
- ✅ Навигация по месяцам (стрелки влево/вправо)
- ✅ Нельзя выйти за пределы текущего года

### Детали уроков
При клике на день с уроками отображается:
- Название урока (RU/ZH)
- Название курса
- Время начала
- Аудитория
- Длительность
- Статус урока (завершён/идёт/скоро начнётся)

## 🎨 Дизайн

### Светлая тема
- Фон: `#FFF3C4` (мягкий жёлтый)
- Карточки: белый фон
- Дни с уроками: `#FBC02D/20` (золотистый)
- Выходные: красный текст
- Сегодня: красная рамка

### Тёмная тема
- Фон: `#1A1410` (тёмно-коричневый)
- Карточки: `#2A2018`
- Дни с уроками: `#4A3A1A` (тёмное золото)
- Выходные: `#E53935` (ярко-красный)
- Сегодня: красная рамка

## 📊 Логика работы

### Получение уроков учителя

```typescript
// 1. Получаем всех учеников учителя
const studentIds = mockTeacherStudents
  .filter(ts => ts.teacher_id === teacherId)
  .map(ts => ts.student_id);

// 2. Получаем уникальные классы этих учеников
const classes = new Set<string>();
studentIds.forEach(studentId => {
  const student = mockStudents.find(s => s.id === studentId);
  if (student?.class_id) {
    classes.add(student.class_id);
  }
});

// 3. Фильтруем уроки по классам учителя и году
const teacherLessons = mockLessons.filter(lesson => {
  if (!teacherClasses.includes(lesson.class_id)) return false;
  const lessonDate = new Date(lesson.scheduled_at);
  return lessonDate.getFullYear() === year;
});
```

### Группировка по датам

```typescript
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
```

## 🗂️ Структура файлов

```
src/pages/
├── TeacherPage.tsx          ← Добавлена вкладка 'schedule'
└── TeacherSchedule.tsx      ← Новый компонент календаря
```

## 🎮 Использование

### Для учителя

1. Войдите как учитель (например, `teacher1@confucius.ru` / `123`)
2. Перейдите на вкладку **"Расписание"**
3. Используйте стрелки для навигации по месяцам
4. Кликайте на подчёркнутые числа для просмотра уроков
5. Нажмите кнопку "←" для возврата к календарю

### Пример

**Октябрь 2026:**
- 12 октября (пн) — 4 урока → кликабельно
- 13 октября (вт) — 4 урока → кликабельно
- 14 октября (ср) — 4 урока → кликабельно
- ...
- 20 октября (вт) — 4 урока → **сегодня** (красная рамка)
- ...

## 🔧 Технические детали

### Компонент TeacherSchedule

```typescript
interface TeacherScheduleProps {
  teacherId: string;
}

type ViewMode = 'calendar' | 'day';

export function TeacherSchedule({ teacherId }: TeacherScheduleProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // ... логика
}
```

### Состояния

- `currentDate` — текущая отображаемая дата (месяц/год)
- `viewMode` — режим просмотра ('calendar' | 'day')
- `selectedDate` — выбранная дата для просмотра уроков

### Вычисляемые значения (useMemo)

- `teacherClasses` — классы учителя
- `teacherLessons` — все уроки учителя на год
- `lessonsByDate` — уроки, сгруппированные по датам
- `selectedDayLessons` — уроки на выбранную дату
- `calendarDays` — массив дней для отображения календаря

## 🌐 Локализация

Компонент полностью поддерживает двуязычность:

### Русский
- Месяцы: Январь, Февраль, Март, ...
- Дни недели: Пн, Вт, Ср, Чт, Пт, Сб, Вс
- "урок(ов) в году"
- "мин"

### Китайский
- Месяцы: 一月, 二月, 三月, ...
- Дни недели: 周一, 周二, 周三, 周四, 周五, 周六, 周日
- "节课/年"
- "分钟"

## 📱 Адаптивность

Календарь полностью адаптивен:
- ✅ Работает на мобильных устройствах
- ✅ Поддерживает тёмную/светлую тему
- ✅ Горизонтальная прокрутка вкладок на маленьких экранах
- ✅ Квадратные ячейки календаря (aspect-square)

## 🚀 Следующие улучшения (опционально)

- [ ] Экспорт расписания в PDF
- [ ] Печать расписания
- [ ] Фильтр по курсам
- [ ] Цветовая кодировка по предметам
- [ ] Перетаскивание уроков (drag & drop)
- [ ] Интеграция с Google Calendar
- [ ] Уведомления о предстоящих уроках

## 🧪 Тестирование

### Проверка календаря

```bash
# 1. Запустить приложение
npm run dev

# 2. Войти как учитель
Email: teacher1@confucius.ru
Password: 123

# 3. Перейти на вкладку "Расписание"

# 4. Проверить:
# - Отображается текущий месяц
# - Дни с уроками подчёркнуты
# - Можно переключаться между месяцами
# - При клике на день открывается список уроков
# - Кнопка "Назад" возвращает к календарю
```

### Проверка на Android

```bash
# Синхронизация с Android
npx cap sync android
npx cap open android

# Тестировать на устройстве/эмуляторе
```

## 📝 SQL запросы для проверки (API режим)

```sql
-- Получить все уроки учителя
SELECT 
    cl.id,
    cl.title,
    cl.scheduled_at,
    cl.room,
    c.name as class_name
FROM course_lessons cl
JOIN classes c ON c.id = cl.class_id
WHERE cl.class_id IN (
    SELECT DISTINCT s.class_id
    FROM teacher_students ts
    JOIN students s ON s.id = ts.student_id
    WHERE ts.teacher_id = 't-1'  -- ID учителя
)
AND EXTRACT(YEAR FROM cl.scheduled_at) = 2026
ORDER BY cl.scheduled_at;

-- Получить уроки на конкретную дату
SELECT *
FROM course_lessons
WHERE DATE(scheduled_at) = '2026-10-20'
AND class_id IN (
    SELECT DISTINCT s.class_id
    FROM teacher_students ts
    JOIN students s ON s.id = ts.student_id
    WHERE ts.teacher_id = 't-1'
);
```

## ✅ Результат

✅ Учителя видят расписание на текущий год  
✅ Интерактивный календарь с навигацией по месяцам  
✅ Клик на день показывает список уроков  
✅ Полная поддержка RU/ZH локализации  
✅ Адаптивный дизайн для мобильных устройств  
✅ Поддержка тёмной/светлой темы

---

**Дата добавления:** 2026-10-20  
**Затронутые файлы:**
- `src/pages/TeacherPage.tsx` (добавлена вкладка)
- `src/pages/TeacherSchedule.tsx` (новый компонент)
- `src/i18n/translations.ts` (перевод уже существовал)
