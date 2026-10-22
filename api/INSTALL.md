# 🚀 Установка и запуск API сервера

## 📋 Пошаговая инструкция

### Шаг 1: Перейти в папку API

```powershell
cd C:\Users\mkuzn\AndroidStudioProjects\confucius\api
```

### Шаг 2: Установить зависимости

```powershell
npm install
```

**Ожидаемый результат:**
- Установится ~134 пакета
- Появится папка `node_modules/`
- Могут быть предупреждения о устаревших пакетах (это нормально для bcrypt)

### Шаг 3: Проверить конфигурацию

Файл `.env` уже создан с настройками по умолчанию:
- PostgreSQL: `localhost:5432`
- База данных: `confucius_school`
- Пользователь: `postgres`
- Пароль: `postgres`

**Если нужно изменить**, отредактируйте `api/.env`:
```bash
DATABASE_HOST=your-host
DATABASE_PORT=5432
DATABASE_NAME=confucius_school
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
```

### Шаг 4: Запустить сервер

```powershell
npm run dev
```

**Ожидаемый результат:**
```
✅ PostgreSQL подключён успешно
   Host: localhost:5432
   Database: confucius_school

╔═══════════════════════════════════════════════════════════╗
║  API сервер "Школа Конфуция" запущен                     ║
╠═══════════════════════════════════════════════════════════╣
║  URL: http://0.0.0.0:3000
║  Режим: development
╚═══════════════════════════════════════════════════════════╝
```

### Шаг 5: Проверить работу

Откройте в браузере:
```
http://localhost:3000/health
```

Должен вернуться JSON:
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T...",
  "version": "1.0.0"
}
```

---

## ❗ Частые проблемы

### Проблема 1: "Missing script: dev"

**Причина:** Вы запустили `npm run dev` не в папке `api/`

**Решение:**
```powershell
# Перейти в правильную папку
cd C:\Users\mkuzn\AndroidStudioProjects\confucius\api

# Проверить, что package.json содержит скрипт dev
type package.json

# Должна быть строка: "dev": "tsx watch src/index.ts"

# Запустить снова
npm run dev
```

### Проблема 2: "Cannot find module 'tsx'"

**Причина:** Зависимости не установлены

**Решение:**
```powershell
cd api
npm install
```

### Проблема 3: Ошибка подключения к PostgreSQL

**Причина:** PostgreSQL не запущен или неправильные credentials

**Решение:**
1. Проверьте, что PostgreSQL запущен:
   ```powershell
   # Windows
   Get-Service postgresql*
   
   # Или через pgAdmin
   ```

2. Проверьте настройки в `api/.env`:
   ```bash
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=confucius_school
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   ```

3. Создайте базу данных (если ещё не создана):
   ```powershell
   createdb -U postgres confucius_school
   ```

4. Выполните SQL скрипты:
   ```powershell
   psql -U postgres -d confucius_school -f ../sql/01_schema.sql
   psql -U postgres -d confucius_school -f ../sql/02_seed_data.sql
   psql -U postgres -d confucius_school -f ../sql/03_triggers_and_seed.sql
   ```

### Проблема 4: Порт 3000 уже занят

**Причина:** Другой процесс использует порт 3000

**Решение:**
Измените порт в `api/.env`:
```bash
PORT=3001
```

Или найдите и остановите процесс:
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🧪 Тестирование API

### 1. Health Check

```powershell
curl http://localhost:3000/health
```

### 2. Login

```powershell
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\":\"student1@confucius.ru\",\"password\":\"123\"}"
```

Или через PowerShell:
```powershell
$body = @{
    identifier = "student1@confucius.ru"
    password = "123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### 3. Получить курсы (с токеном)

```powershell
$TOKEN = "your-jwt-token-from-login-response"
$headers = @{ "Authorization" = "Bearer $TOKEN" }
Invoke-RestMethod -Uri "http://localhost:3000/api/students/me/courses" -Headers $headers
```

---

## 📝 Команды

### Разработка (с автоперезагрузкой)
```powershell
npm run dev
```

### Production сборка
```powershell
npm run build
npm start
```

### Проверка типов
```powershell
npm run typecheck
```

---

## 🔧 Отладка

### Логи сервера

Сервер выводит логи в консоль:
```
[12:34:56] INFO: POST /api/auth/login - 200 (15ms)
[12:34:57] INFO: GET /api/students/me/courses - 200 (8ms)
```

### Проверка подключения к БД

В коде `api/src/config/database.ts`:
```typescript
await sql`SELECT 1`;
console.log('✅ PostgreSQL подключён успешно');
```

---

## ✅ Чек-лист

- [ ] Перешли в папку `api/`
- [ ] Выполнили `npm install`
- [ ] Проверили `.env` (PostgreSQL настройки)
- [ ] PostgreSQL запущен
- [ ] База данных `confucius_school` создана
- [ ] SQL скрипты выполнены
- [ ] `npm run dev` запущен без ошибок
- [ ] `http://localhost:3000/health` возвращает JSON
- [ ] Login работает (student1@confucius.ru / 123)

---

## 📚 Дополнительная информация

- **Документация API:** `api/README.md`
- **Интеграция с приложением:** `API_INTEGRATION.md`
- **SQL скрипты:** `sql/`

---

**Готово!** 🎉 API сервер запущен и готов к работе.
