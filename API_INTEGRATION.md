# 🔗 Интеграция REST API с мобильным приложением

## 📋 Архитектура

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Мобильное      │  HTTP   │  REST API       │  SQL    │  PostgreSQL     │
│  приложение     │ ◄─────► │  (Node.js)      │ ◄─────► │  (БД)           │
│  (React/Vue)    │  JSON   │  (Fastify)      │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     Порт 5173                Порт 3000                  Порт 5432
```

## 🚀 Быстрый старт

### 1. Запуск API сервера

```bash
# Перейти в папку API
cd api

# Установить зависимости (если ещё не установлены)
npm install

# Настроить .env (уже настроен для локальной разработки)
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_NAME=confucius_school
# DATABASE_USER=postgres
# DATABASE_PASSWORD=postgres

# Запустить сервер
npm run dev
```

Сервер запустится на `http://localhost:3000`

### 2. Переключить мобильное приложение на API

В файле `.env` мобильного приложения:

```bash
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000/api
```

Перезапустить dev-сервер мобильного приложения:

```bash
npm run dev
```

### 3. Тестирование

Откройте мобильное приложение и войдите:
- **Email:** `student1@confucius.ru`
- **Пароль:** `123`

Или по телефону:
- **Телефон:** `+79998880001`
- **Пароль:** `123`

---

## 🔐 Аутентификация

### Flow входа

```
1. Пользователь вводит email/телефон + пароль
2. Мобильное приложение → POST /api/auth/login
3. API проверяет credentials в PostgreSQL
4. API возвращает JWT токен + данные пользователя
5. Мобильное приложение сохраняет токен в localStorage
6. Все последующие запросы включают токен в заголовок Authorization
```

### Пример запроса

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'student1@confucius.ru',
    password: '123'
  })
});

const data = await response.json();
// data.token = "eyJhbGciOiJIUzI1NiIs..."

// Защищённый запрос
const courses = await fetch('http://localhost:3000/api/students/me/courses', {
  headers: {
    'Authorization': `Bearer ${data.token}`
  }
});
```

---

## 📡 API Endpoints

### Аутентификация

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/login` | Вход (email/телефон + пароль) |
| POST | `/api/auth/register` | Регистрация |
| GET | `/api/auth/me` | Текущий пользователь (требует токен) |

### Ученики (требуют роль `student`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/students/me` | Профиль ученика |
| GET | `/api/students/me/courses` | Курсы ученика |
| GET | `/api/students/me/lessons` | Уроки |
| GET | `/api/students/me/homeworks` | Домашние задания |
| GET | `/api/students/me/submissions` | Отправленные ДЗ |
| GET | `/api/students/me/grades` | Оценки |
| GET | `/api/students/me/ratings` | Рейтинги уроков |
| GET | `/api/students/me/attendance` | Посещаемость |
| GET | `/api/students/me/achievements` | Достижения |

### Родители (требуют роль `parent`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/parents/me` | Профиль родителя |
| GET | `/api/parents/me/children` | Список детей |
| GET | `/api/parents/children/:studentId/grades` | Оценки ребёнка |
| GET | `/api/parents/children/:studentId/attendance` | Посещаемость ребёнка |

### Учителя (требуют роль `teacher`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/teachers/me` | Профиль учителя |
| GET | `/api/teachers/me/students` | Список учеников |

### Общие данные (требуют аутентификацию)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/contests` | Конкурсы |
| GET | `/api/events` | Мероприятия |
| GET | `/api/notifications` | Уведомления |
| POST | `/api/notifications/:id/read` | Отметить как прочитанное |
| GET | `/api/points` | Баланс баллов |
| GET | `/api/points/transactions` | История транзакций |

---

## 🔄 Переключение между MOCK и API

### Способ 1: Через `.env`

```bash
# MOCK режим (локальные данные)
VITE_USE_MOCK=true

# API режим (реальный сервер)
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000/api
```

### Способ 2: Через localStorage

```javascript
// В консоли браузера
localStorage.setItem('confucius_use_mock', 'true')   // MOCK
localStorage.setItem('confucius_use_mock', 'false')  // API
location.reload()
```

---

## 🌐 Production деплой

### 1. Настройка API сервера

```bash
# .env API сервера
NODE_ENV=production
DATABASE_HOST=your-production-db-host
DATABASE_PASSWORD=strong-password
JWT_SECRET=very-long-random-secret-key
CORS_ORIGIN=https://your-domain.com
```

### 2. Настройка мобильного приложения

```bash
# .env мобильного приложения
VITE_USE_MOCK=false
VITE_API_URL=https://api.confucius.ru
```

### 3. CORS

Для работы с мобильным приложением добавьте домен в `CORS_ORIGIN`:

```bash
# api/.env
CORS_ORIGIN=http://localhost:5173,https://your-domain.com,capacitor://localhost
```

---

## 🧪 Тестирование API

### Health Check

```bash
curl http://localhost:3000/health
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"student1@confucius.ru","password":"123"}'
```

### Получить курсы (с токеном)

```bash
TOKEN="your-jwt-token"
curl http://localhost:3000/api/students/me/courses \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Обработка ошибок

API возвращает ошибки в формате:

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

HTTP статусы:
- `200` — Успех
- `400` — Ошибка валидации
- `401` — Неавторизован
- `403` — Доступ запрещён
- `404` — Не найдено
- `409` — Конфликт (например, пользователь уже существует)
- `500` — Внутренняя ошибка сервера

---

## 🔧 Отладка

### Логи API сервера

API сервер выводит логи в консоль:

```
[12:34:56] INFO: POST /api/auth/login - 200 (15ms)
[12:34:57] INFO: GET /api/students/me/courses - 200 (8ms)
```

### Логи мобильного приложения

В консоли браузера/устройства:

```javascript
// Проверить текущий режим
import { getMockModeStatus } from './src/config';
console.log(getMockModeStatus());

// Проверить токен
console.log(localStorage.getItem('confucius_auth_token'));
```

---

## 📚 Дополнительная информация

- **API сервер:** `api/README.md`
- **Переключение MOCK/API:** `MOCK_API_SWITCH.md`
- **SQL скрипты:** `sql/01_schema.sql`, `sql/02_seed_data.sql`, `sql/03_triggers_and_seed.sql`

---

## ✅ Чек-лист интеграции

- [ ] API сервер запущен (`npm run dev` в папке `api/`)
- [ ] PostgreSQL запущен с выполненными скриптами
- [ ] `.env` мобильного приложения настроен (`VITE_USE_MOCK=false`)
- [ ] CORS настроен в API сервере
- [ ] Тестовый вход работает (student1@confucius.ru / 123)
- [ ] Все эндпоинты возвращают данные
- [ ] Токен сохраняется в localStorage
- [ ] Защищённые запросы работают с токеном

---

**Готово!** 🎉 Мобильное приложение теперь работает с реальным API сервером и PostgreSQL базой данных.
