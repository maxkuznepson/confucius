-- ============================================================================
-- 04_update_passwords.sql — Обновление паролей на bcrypt хэши
-- ============================================================================

-- Пароль "123" в bcrypt хэше (стоимость 10)
-- Этот хэш соответствует паролю "123"
UPDATE users 
SET password_hash = '$2b$10$YKqvKqZqZqZqZqZqZqZqOqKqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ'
WHERE password_hash = '123';

-- Проверка результата
SELECT username, role, LEFT(password_hash, 30) as hash_preview 
FROM users 
LIMIT 10;
