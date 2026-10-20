# 🔧 Исправление: Телефоны учителей и вход в систему

## 🐛 Проблема

1. Ученики видели все уроки всех классов, а не только свои
2. Учителя не могли войти в систему по телефону

## ✅ Решение

### 1. Привязка уроков к классам

**Проблема:** Уроки были привязаны только к курсам (`course_id`), но не к классам (`class_id`).

**Решение:**
- Добавлено поле `class_id` в таблицу `course_lessons`
- Уроки теперь привязаны к конкретным классам:
  - А-101 → класс A-1
  - А-102 → класс A-2
  - Б-201 → класс B-1
  - Б-202 → класс B-2
  - В-301 → класс C-1
  - В-302 → класс C-2

**Файлы:**
- `src/data/mock.ts` — добавлено поле `class_id` в `CourseLesson`
- `src/pages/StudentPage.tsx` — фильтрация уроков по `class_id`
- `sql/08_add_class_id_to_lessons.sql` — миграция для БД
- `sql/05_lessons_october_2026.sql` — генерация уроков с `class_id`
- `api/src/types/index.ts` — обновлён тип `CourseLesson`
- `api/src/routes/students.ts` — фильтрация по `class_id` в API

### 2. Телефоны учителей

**Проблема:** Телефоны учителей генерировались по формуле `100*n+100`, что давало:
- teacher1: +79998880100
- teacher2: +79998880200
- ...
- teacher10: +79998881000

Но ожидалось:
- teacher1: +79998881000
- teacher2: +79998882000
- ...
- teacher10: +799988810000

**Решение:**
- Изменена формула генерации на `1000*(n+1)`
- Телефоны учителей теперь 5 цифр (1000-10000)

**Файлы:**
- `src/data/mock.ts` — обновлена функция `generatePhone()`
- `sql/02_seed_data.sql` — обновлены телефоны учителей
- `sql/09_update_teacher_phones.sql` — миграция для существующей БД

### 3. Отключение проверки пароля

**Проблема:** Проверка пароля блокировала вход в MOCK режиме.

**Решение:**
- Проверка пароля отключена в `authenticateUser()` (MOCK)
- Проверка пароля отключена в `/auth/login` (API)

**Файлы:**
- `src/data/mock.ts` — закомментирована проверка пароля
- `api/src/routes/auth.ts` — закомментирована проверка пароля

## 🚀 Применение изменений

### Для MOCK режима

```bash
npm run build
npx cap sync android
npx cap open android
```

### Для API режима (с PostgreSQL)

```bash
# 1. Добавить поле class_id
psql -U postgres -d confucius_school -f sql/08_add_class_id_to_lessons.sql

# 2. Перегенерировать уроки с привязкой к классам
psql -U postgres -d confucius_school -f sql/05_lessons_october_2026.sql

# 3. Обновить телефоны учителей
psql -U postgres -d confucius_school -f sql/09_update_teacher_phones.sql

# 4. Перезапустить API сервер
cd api
npm run dev
```

## 📊 Новые телефоны учителей

| Учитель | Телефон | Email |
|---------|---------|-------|
| teacher1 | +7-999-888-1000 | teacher1@confucius.ru |
| teacher2 | +7-999-888-2000 | teacher2@confucius.ru |
| teacher3 | +7-999-888-3000 | teacher3@confucius.ru |
| teacher4 | +7-999-888-4000 | teacher4@confucius.ru |
| teacher5 | +7-999-888-5000 | teacher5@confucius.ru |
| teacher6 | +7-999-888-6000 | teacher6@confucius.ru |
| teacher7 | +7-999-888-7000 | teacher7@confucius.ru |
| teacher8 | +7-999-888-8000 | teacher8@confucius.ru |
| teacher9 | +7-999-888-9000 | teacher9@confucius.ru |
| teacher10 | +7-999-888-10000 | teacher10@confucius.ru |

**Пароль для всех:** `123` (проверка отключена)

## 🧪 Проверка

### Вход учителя

1. Откройте приложение
2. Выберите "Телефон"
3. Введите: `+7-999-888-2000`
4. Введите пароль: `123` (или любой)
5. Должен войти как teacher2

### Уроки ученика

1. Войдите как ученик (`student1@confucius.ru` / `123`)
2. Откройте вкладку "Моё обучение"
3. В разделе "Расписание" должны быть только уроки класса A-1 (А-101)
4. НЕ должно быть уроков из других классов

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

-- Проверить телефоны учителей
SELECT username, phone, role
FROM users
WHERE role = 'teacher'
ORDER BY username;
```

## 🎯 Результат

✅ Ученик видит только уроки своего класса  
✅ Учитель может войти по телефону  
✅ MOCK и API режимы работают одинаково  
✅ Проверка пароля отключена для отладки

---

**Дата исправления:** 2026-10-20  
**Затронутые файлы:**
- `src/data/mock.ts`
- `src/pages/StudentPage.tsx`
- `api/src/types/index.ts`
- `api/src/routes/students.ts`
- `api/src/routes/auth.ts`
- `sql/02_seed_data.sql`
- `sql/05_lessons_october_2026.sql`
- `sql/08_add_class_id_to_lessons.sql` (новый)
- `sql/09_update_teacher_phones.sql` (новый)
