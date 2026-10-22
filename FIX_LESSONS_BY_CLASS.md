# 🔧 Исправление: Ученик видит только свои уроки

## 🐛 Проблема

Ученик видел **все уроки всех классов**, а должен видеть только уроки своего класса.

**Причина:** Уроки были привязаны только к курсам (`course_id`), но не к классам (`class_id`). Поскольку все студенты записаны на курсы `crs-1` и `crs-2`, они видели все уроки этих курсов для всех классов.

## ✅ Решение

Добавлена привязка уроков к конкретным классам через поле `class_id` в таблице `course_lessons`.

### Что изменилось

1. **MOCK данные** (`src/data/mock.ts`):
   - Добавлено поле `class_id` в интерфейс `CourseLesson`
   - Функция `generateMockLessons()` теперь привязывает каждый урок к конкретному классу
   - Фильтрация в `StudentPage.tsx` учитывает `class_id` студента

2. **SQL схема** (`sql/08_add_class_id_to_lessons.sql`):
   - Добавлено поле `class_id UUID REFERENCES classes(id)` в таблицу `course_lessons`
   - Создан индекс для быстрого поиска

3. **SQL скрипты** (`sql/05_lessons_october_2026.sql`):
   - Уроки генерируются с привязкой к классам:
     - А-101 → класс A-1
     - А-102 → класс A-2
     - Б-201 → класс B-1
     - Б-202 → класс B-2
     - В-301 → класс C-1
     - В-302 → класс C-2

4. **API сервис** (`api/src/routes/students.ts`):
   - Эндпоинт `/students/me/lessons` теперь фильтрует уроки по `class_id` студента
   - API типы обновлены для поддержки `class_id`

## 🚀 Применение изменений

### Для MOCK режима

Просто пересоберите проект:

```bash
npm run build
npx cap sync android
npx cap open android
```

### Для API режима (с PostgreSQL)

Выполните миграции в порядке:

```bash
# 1. Добавить поле class_id
psql -U postgres -d confucius_school -f sql/08_add_class_id_to_lessons.sql

# 2. Перегенерировать уроки с привязкой к классам
psql -U postgres -d confucius_school -f sql/05_lessons_october_2026.sql

# 3. Перезапустить API сервер
cd api
npm run dev
```

## 📊 Структура данных

### Пример урока

```typescript
{
  id: "l-1",
  course_id: "crs-1",           // Китайский язык
  class_id: "class-1",          // Класс A-1
  title: "Урок 1: Приветствия",
  title_zh: "第1课：问候",
  lesson_order: 1,
  scheduled_at: "2026-10-12T09:00:00",
  duration_min: 45,
  room: "А-101",
  live_status: "finished"
}
```

### Фильтрация уроков

```typescript
// Ученик из класса A-1 видит только уроки с class_id = "class-1"
const studentLessons = mockLessons.filter(l => 
  enrolledCourseIds.includes(l.course_id) && 
  l.class_id === studentClassId
);
```

## 🧪 Проверка

### MOCK режим

1. Войдите как ученик (`student1@confucius.ru` / `123`)
2. Откройте вкладку "Моё обучение"
3. В разделе "Расписание" должны быть только уроки класса A-1:
   - А-101 (09:00)
   - НЕ должно быть уроков из А-102, Б-201, Б-202 и т.д.

### API режим

```bash
# Получить уроки студента
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/students/me/lessons

# Ответ должен содержать только уроки класса студента
```

## 📝 SQL запросы для проверки

```sql
-- Проверить привязку уроков к классам
SELECT 
    cl.id,
    cl.title,
    cl.room,
    c.name as class_name,
    cl.class_id
FROM course_lessons cl
LEFT JOIN classes c ON c.id = cl.class_id
ORDER BY cl.scheduled_at
LIMIT 20;

-- Проверить, сколько уроков видит каждый класс
SELECT 
    c.name as class_name,
    COUNT(cl.id) as lesson_count
FROM classes c
LEFT JOIN course_lessons cl ON cl.class_id = c.id
GROUP BY c.name
ORDER BY c.name;
```

## 🎯 Результат

✅ Ученик видит только уроки своего класса  
✅ MOCK и API режимы работают одинаково  
✅ Данные синхронизированы между фронтендом и бэкендом  
✅ Производительность улучшена за счёт индекса на `class_id`

---

**Дата исправления:** 2026-10-20  
**Затронутые файлы:**
- `src/data/mock.ts`
- `src/pages/StudentPage.tsx`
- `api/src/types/index.ts`
- `api/src/routes/students.ts`
- `sql/05_lessons_october_2026.sql`
- `sql/08_add_class_id_to_lessons.sql` (новый)
