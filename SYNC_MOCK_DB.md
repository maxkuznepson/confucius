# 🔄 Синхронизация MOCK и БД

## 📋 Обзор

Приложение поддерживает два режима работы:
- **MOCK режим** (`VITE_USE_MOCK=true`) — локальные данные из `src/data/mock.ts`
- **API режим** (`VITE_USE_MOCK=false`) — данные из PostgreSQL через REST API

## ✅ Что синхронизировано

### 1. Структура данных

| MOCK (TypeScript) | SQL (PostgreSQL) | API Endpoint |
|-------------------|------------------|--------------|
| `mockUsers` | `users` | `/auth/*` |
| `mockStudents` | `students` | `/students/*` |
| `mockParents` | `parents` | `/parents/*` |
| `mockTeachers` | `teachers` | `/teachers/*` |
| `mockCourses` | `courses` | `/courses/*` |
| `mockLessons` | `course_lessons` | `/students/me/lessons`, `/teachers/me/schedule` |
| `mockHomeworks` | `homeworks` | `/students/me/homeworks` |
| `mockGrades` | `grades` | `/students/me/grades` |
| `mockAttendance` | `attendance` | `/students/me/attendance` |

### 2. Ключевые изменения

#### Телефоны учителей
- **Формат:** `+79998881000`, `+79998882000`, ..., `+799988810000`
- **SQL:** `sql/09_update_teacher_phones.sql`
- **MOCK:** `generatePhone()` в `src/data/mock.ts`

#### Привязка уроков к классам
- **Поле:** `class_id` в `course_lessons`
- **SQL:** `sql/08_add_class_id_to_lessons.sql`
- **MOCK:** `generateMockLessons()` в `src/data/mock.ts`

#### Расписание учителя
- **API:** `GET /teachers/me/schedule?year=2026`
- **SQL:** `sql/10_optimize_teacher_schedule.sql` (индексы)
- **MOCK:** `getTeacherSchedule()` в `MockApiService.ts`

## 🚀 Установка для работы с БД

### Шаг 1: Выполнить SQL-скрипты в порядке

```bash
# 1. Создание схемы
psql -U postgres -d confucius_school -f sql/01_schema.sql

# 2. Основные данные (пользователи, курсы, классы)
psql -U postgres -d confucius_school -f sql/02_seed_data.sql

# 3. Триггеры и дополнительные данные
psql -U postgres -d confucius_school -f sql/03_triggers_and_seed.sql

# 4. Хэширование паролей (bcrypt)
psql -U postgres -d confucius_school -f sql/04_update_passwords.sql

# 5. Уроки на октябрь 2026 с привязкой к классам
psql -U postgres -d confucius_school -f sql/05_lessons_october_2026.sql

# 6. Добавление поля title_zh для уроков
psql -U postgres -d confucius_school -f sql/06_add_title_zh_to_lessons.sql

# 7. Обновление всех дат на октябрь 2026
psql -U postgres -d confucius_school -f sql/07_update_dates_to_october_2026.sql

# 8. Привязка уроков к классам (миграция)
psql -U postgres -d confucius_school -f sql/08_add_class_id_to_lessons.sql

# 9. Обновление телефонов учителей
psql -U postgres -d confucius_school -f sql/09_update_teacher_phones.sql

# 10. Оптимизация запросов расписания
psql -U postgres -d confucius_school -f sql/10_optimize_teacher_schedule.sql
```

### Шаг 2: Настроить API сервер

```bash
cd api

# Установить зависимости
npm install

# Настроить .env
cat > .env << EOF
PORT=3000
NODE_ENV=development
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=confucius_school
DATABASE_USER=postgres
DATABASE_PASSWORD=
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
EOF

# Запустить сервер
npm run dev
```

### Шаг 3: Переключить фронтенд на API режим

```bash
# В корне проекта
cat > .env << EOF
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000/api
EOF

# Перезапустить dev-сервер
npm run dev
```

## 🧪 Проверка синхронизации

### Тест 1: Вход учителя

```bash
# MOCK режим
Email: teacher1@confucius.ru
Password: 123

# API режим (тот же результат)
Email: teacher1@confucius.ru
Password: 123
```

### Тест 2: Расписание учителя

**MOCK режим:**
1. Войти как teacher1
2. Перейти на вкладку "Расписание"
3. Должны увидеть уроки на октябрь 2026

**API режим:**
1. Войти как teacher1
2. Перейти на вкладку "Расписание"
3. Должны увидеть те же уроки из БД

### Тест 3: API запросы

```bash
# Получить расписание учителя
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/teachers/me/schedule?year=2026"

# Ожидаемый ответ:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "course_id": "...",
      "class_id": "...",
      "title": "Урок 1: Приветствия",
      "title_zh": "第1课：问候",
      "scheduled_at": "2026-10-12T09:00:00.000Z",
      "duration_min": 45,
      "room": "А-101",
      "live_status": "finished"
    },
    ...
  ]
}
```

## 📊 Структура SQL-скриптов

```
sql/
├── 01_schema.sql                      ← Создание таблиц
├── 02_seed_data.sql                   ← Основные данные
├── 03_triggers_and_seed.sql           ← Триггеры и доп. данные
├── 04_update_passwords.sql            ← Хэширование паролей
├── 05_lessons_october_2026.sql        ← Уроки на октябрь 2026
├── 06_add_title_zh_to_lessons.sql     ← Добавление title_zh
├── 07_update_dates_to_october_2026.sql ← Обновление дат
├── 08_add_class_id_to_lessons.sql     ← Привязка уроков к классам
├── 09_update_teacher_phones.sql       ← Телефоны учителей
└── 10_optimize_teacher_schedule.sql   ← Оптимизация запросов
```

## 🔍 Проверка данных в БД

### Телефоны учителей

```sql
SELECT username, phone
FROM users
WHERE role = 'teacher'
ORDER BY username;

-- Ожидаемый результат:
-- teacher1  | +79998881000
-- teacher2  | +79998882000
-- ...
-- teacher10 | +799988810000
```

### Привязка уроков к классам

```sql
SELECT 
    cl.id,
    cl.title,
    cl.room,
    c.name as class_name,
    cl.class_id
FROM course_lessons cl
LEFT JOIN classes c ON c.id = cl.class_id
ORDER BY cl.scheduled_at
LIMIT 10;

-- Ожидаемый результат:
-- Урок 1: Приветствия | А-101 | A-1 | class_id_1
-- Урок 1: Приветствия | А-102 | A-2 | class_id_2
-- ...
```

### Расписание учителя

```sql
-- Получить все уроки учителя teacher1 на 2026 год
SELECT DISTINCT cl.*
FROM course_lessons cl
JOIN classes c ON c.id = cl.class_id
JOIN students s ON s.class_id = c.id
JOIN teacher_students ts ON ts.student_id = s.id
JOIN teachers t ON t.id = ts.teacher_id
WHERE t.user_id = 'a0000000-0000-0000-0000-000000000001'  -- teacher1
  AND EXTRACT(YEAR FROM cl.scheduled_at) = 2026
ORDER BY cl.scheduled_at ASC;
```

## 🐛 Отладка

### Проблема: Учитель не видит уроки

**Причина:** Уроки не привязаны к классам учителя

**Решение:**
```sql
-- Проверить, есть ли классы у учеников учителя
SELECT DISTINCT s.class_id
FROM teacher_students ts
JOIN students s ON s.id = ts.student_id
WHERE ts.teacher_id = 'teacher_id_here';

-- Если пусто — назначить учеников учителю
INSERT INTO teacher_students (teacher_id, student_id, subject)
VALUES ('teacher_id', 'student_id', 'Китайский язык');
```

### Проблема: Расписание пустое

**Причина:** Нет уроков на указанный год

**Решение:**
```sql
-- Проверить, есть ли уроки на 2026 год
SELECT COUNT(*) 
FROM course_lessons 
WHERE EXTRACT(YEAR FROM scheduled_at) = 2026;

-- Если 0 — выполнить скрипт 05
psql -U postgres -d confucius_school -f sql/05_lessons_october_2026.sql
```

### Проблема: API возвращает ошибку

**Причина:** Не настроен API сервер или БД

**Решение:**
```bash
# Проверить, что API сервер запущен
curl http://localhost:3000/health

# Проверить логи API сервера
cd api
npm run dev

# Проверить подключение к БД
psql -U postgres -d confucius_school -c "SELECT 1"
```

## 📝 Примечания

1. **MOCK режим** используется для разработки и тестирования без БД
2. **API режим** используется для production с реальной БД
3. Все данные синхронизированы между MOCK и SQL
4. API возвращает данные в том же формате, что и MOCK
5. Компоненты работают одинаково в обоих режимах

## 🎯 Результат

✅ MOCK и API режимы работают одинаково  
✅ Все данные синхронизированы  
✅ Расписание учителя работает через API  
✅ Телефоны учителей корректны  
✅ Уроки привязаны к классам  
✅ Оптимизированы запросы к БД

---

**Дата обновления:** 2026-10-20  
**SQL-скрипты:** 10 файлов  
**API endpoints:** 20+ эндпоинтов  
**MOCK данные:** 130 пользователей, 114 уроков
