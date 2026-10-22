-- ============================================================================
-- 04_update_passwords.sql — Обновление паролей на bcrypt хэши
-- Использует pgcrypto для хэширования паролей в PostgreSQL
-- ============================================================================

-- Убедимся, что расширение pgcrypto установлено
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Обновляем все пароли "123" на bcrypt хэши
-- crypt() с gen_salt('bf', 10) создаёт bcrypt хэш с cost factor 10
UPDATE users 
SET password_hash = crypt('123', gen_salt('bf', 10))
WHERE password_hash = '123';

-- Проверка результата
SELECT 
    username, 
    role, 
    LEFT(password_hash, 30) as hash_preview,
    LENGTH(password_hash) as hash_length
FROM users 
ORDER BY username
LIMIT 15;

-- Проверка, что хэши работают (должно вернуть количество обновлённых записей)
SELECT COUNT(*) as updated_count
FROM users
WHERE password_hash LIKE '$2a$10$%' OR password_hash LIKE '$2b$10$%';
