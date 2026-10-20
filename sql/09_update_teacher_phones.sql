-- ============================================================================
-- 09_update_teacher_phones.sql — Обновление телефонов учителей
-- Синхронизация с MOCK данными
-- ============================================================================

-- Обновляем телефоны учителей на новые значения
UPDATE users
SET phone = CASE username
    WHEN 'teacher1' THEN '+79998881000'
    WHEN 'teacher2' THEN '+79998882000'
    WHEN 'teacher3' THEN '+79998883000'
    WHEN 'teacher4' THEN '+79998884000'
    WHEN 'teacher5' THEN '+79998885000'
    WHEN 'teacher6' THEN '+79998886000'
    WHEN 'teacher7' THEN '+79998887000'
    WHEN 'teacher8' THEN '+79998888000'
    WHEN 'teacher9' THEN '+79998889000'
    WHEN 'teacher10' THEN '+799988810000'
END
WHERE username IN ('teacher1', 'teacher2', 'teacher3', 'teacher4', 'teacher5', 
                   'teacher6', 'teacher7', 'teacher8', 'teacher9', 'teacher10');

-- Проверка результата
SELECT username, phone, role
FROM users
WHERE role = 'teacher'
ORDER BY username;
