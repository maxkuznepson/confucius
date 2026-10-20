-- ============================================================================
-- 06_add_title_zh_to_lessons.sql — Добавление поля title_zh в course_lessons
-- Миграция для поддержки двуязычных названий уроков
-- ============================================================================

-- Добавляем поле title_zh в таблицу course_lessons
ALTER TABLE course_lessons 
ADD COLUMN IF NOT EXISTS title_zh VARCHAR(255);

-- Проверка результата
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'course_lessons'
ORDER BY ordinal_position;
