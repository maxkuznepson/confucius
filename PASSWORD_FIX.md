# 🔐 Исправление проблемы с паролями

## Проблема

Пароли в базе данных хранятся как открытый текст `"123"`, а API ожидает bcrypt-хэши. Это вызывает ошибку 401 при входе.

## Решение

Запустите скрипт `04_update_passwords.sql` для хэширования паролей через pgcrypto.

### Шаг 1: Выполните SQL-скрипт

```bash
psql -U postgres -d confucius_school -f sql/04_update_passwords.sql
```

Или через pgAdmin:
1. Откройте pgAdmin
2. Подключитесь к базе `confucius_school`
3. Откройте Query Tool
4. Скопируйте содержимое `sql/04_update_passwords.sql`
5. Выполните запрос (F5)

### Шаг 2: Проверьте результат

Должны увидеть:
- Все пароли обновлены на bcrypt-хэши (начинаются с `$2a$10$` или `$2b$10$`)
- Длина хэша: 60 символов
- Количество обновлённых записей: 130 (все пользователи)

### Шаг 3: Попробуйте войти снова

Откройте http://localhost:5173 и войдите:
- **Email:** `student1@confucius.ru`
- **Пароль:** `123`

Теперь вход должен работать!

## Что делает скрипт

```sql
-- Хэширует пароль "123" через bcrypt (cost factor 10)
UPDATE users 
SET password_hash = crypt('123', gen_salt('bf', 10))
WHERE password_hash = '123';
```

Функция `crypt()` из расширения `pgcrypto` генерирует правильный bcrypt-хэш, который совместим с Node.js библиотекой `bcrypt`.

## Для будущих установок

Если вы переустанавливаете базу данных с нуля, выполняйте скрипты в порядке:

```bash
psql -U postgres -d confucius_school -f sql/01_schema.sql
psql -U postgres -d confucius_school -f sql/02_seed_data.sql
psql -U postgres -d confucius_school -f sql/03_triggers_and_seed.sql
psql -U postgres -d confucius_school -f sql/04_update_passwords.sql  # ← НОВЫЙ
```

## Проверка хэшей

Чтобы убедиться, что пароли правильно захэшированы:

```sql
SELECT 
    username, 
    role,
    LEFT(password_hash, 10) as hash_start,
    LENGTH(password_hash) as length
FROM users
ORDER BY username
LIMIT 10;
```

Должны увидеть:
- `hash_start`: `$2a$10$` или `$2b$10$`
- `length`: 60

## Альтернатива: Сброс одного пользователя

Если нужно сбросить пароль только для одного пользователя:

```sql
UPDATE users 
SET password_hash = crypt('123', gen_salt('bf', 10))
WHERE username = 'student1';
```

## Проверка работы bcrypt

Чтобы проверить, что хэш работает правильно:

```sql
SELECT 
    username,
    password_hash = crypt('123', password_hash) as password_valid
FROM users
WHERE username = 'student1';
```

Должно вернуть `password_valid = true`.

## Если проблема сохраняется

1. Проверьте, что API сервер запущен: `cd api && npm run dev`
2. Проверьте логи API сервера при попытке входа
3. Проверьте консоль браузера (F12) на ошибки
4. Убедитесь, что открываете http://localhost:5173 (не 3000!)

---

**Запустите `04_update_passwords.sql` и попробуйте войти снова!** 🚀
