-- ============================================================================
-- 10_optimize_teacher_schedule.sql — Оптимизация запросов расписания учителя
-- Добавление индексов для ускорения запросов расписания
-- ============================================================================

-- Индекс для быстрого поиска уроков по году
CREATE INDEX IF NOT EXISTS idx_course_lessons_year 
ON course_lessons (EXTRACT(YEAR FROM scheduled_at));

-- Индекс для быстрого поиска уроков по классу и году
CREATE INDEX IF NOT EXISTS idx_course_lessons_class_year 
ON course_lessons (class_id, EXTRACT(YEAR FROM scheduled_at));

-- Индекс для быстрого поиска учеников по учителю
CREATE INDEX IF NOT EXISTS idx_teacher_students_teacher 
ON teacher_students (teacher_id);

-- Индекс для быстрого поиска учеников по классу
CREATE INDEX IF NOT EXISTS idx_students_class 
ON students (class_id);

-- Проверка созданных индексов
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('course_lessons', 'teacher_students', 'students')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Тестовый запрос для проверки производительности
-- (должен использовать индексы)
EXPLAIN ANALYZE
SELECT DISTINCT cl.*
FROM course_lessons cl
JOIN classes c ON c.id = cl.class_id
JOIN students s ON s.class_id = c.id
JOIN teacher_students ts ON ts.student_id = s.id
JOIN teachers t ON t.id = ts.teacher_id
WHERE t.user_id = 'a0000000-0000-0000-0000-000000000001'  -- teacher1
  AND EXTRACT(YEAR FROM cl.scheduled_at) = 2026
ORDER BY cl.scheduled_at ASC;
