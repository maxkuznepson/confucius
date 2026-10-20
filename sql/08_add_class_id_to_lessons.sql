-- ============================================================================
-- 08_add_class_id_to_lessons.sql — Добавление поля class_id в course_lessons
-- Привязка уроков к конкретным классам
-- ============================================================================

-- Добавляем поле class_id
ALTER TABLE course_lessons 
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE CASCADE;

-- Создаём индекс для быстрого поиска уроков по классу
CREATE INDEX IF NOT EXISTS idx_lessons_class ON course_lessons(class_id);

-- Заполняем class_id на основе room (временное решение для существующих данных)
-- A-101, A-102 -> класс A-1, A-2 (course_id = crs-1)
-- Б-201, Б-202 -> класс B-1, B-2 (course_id = crs-2)
-- В-301, В-302 -> класс C-1, C-2 (course_id = crs-3)

UPDATE course_lessons
SET class_id = (
    SELECT c.id FROM classes c 
    WHERE c.name = CASE
        WHEN cl.room = 'А-101' THEN 'A-1'
        WHEN cl.room = 'А-102' THEN 'A-2'
        WHEN cl.room = 'Б-201' THEN 'B-1'
        WHEN cl.room = 'Б-202' THEN 'B-2'
        WHEN cl.room = 'В-301' THEN 'C-1'
        WHEN cl.room = 'В-302' THEN 'C-2'
    END
)
FROM course_lessons cl
WHERE course_lessons.id = cl.id;

-- Проверка результата
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
