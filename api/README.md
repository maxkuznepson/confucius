# 🏯 Confucius School API

REST API сервер для мобильного приложения "Школа Конфуция" на Node.js + Fastify + PostgreSQL.

## 📋 Требования

- **Node.js** 18+ 
- **PostgreSQL** 14+ (с выполненными скриптами `01_schema.sql`, `02_seed_data.sql`, `03_triggers_and_seed.sql`)
- **npm** 9+

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd api
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и настройте параметры:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```bash
# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=confucius_school
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS (разрешённые домены)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 3. Запуск сервера

**Режим разработки** (с автоперезагрузкой):
```bash
npm run dev
```

**Production сборка:**
```bash
npm run build
npm start
```

### 4. Проверка работы

Сервер запустится на `http://localhost:3000`

Проверьте health check:
```bash
curl http://localhost:3000/health
```

## 📡 API Endpoints

### Аутентификация

#### POST `/api/auth/login`
Вход в систему по email, телефону или username.

**Request:**
```json
{
  "identifier": "student1@confucius.ru",
  "password": "123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "student1",
      "full_name": "Иванов Иван",
      "email": "student1@confucius.ru",
      "phone": "+79998880001",
      "role": "student",
      "preferred_lang": "ru"
    },
    "token": "jwt-token",
    "role": "student",
    "profile": { ... }
  }
}
```

#### POST `/api/auth/register`
Регистрация нового пользователя.

**Request:**
```json
{
  "phone": "+79998880001",
  "email": "newuser@confucius.ru",
  "lastName": "Иванов",
  "firstName": "Иван",
  "middleName": "Иванович",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Получить информацию о текущем пользователе (требует JWT токен).

**Headers:**
```
Authorization: Bearer <token>
```

---

### Ученики

Все эндпоинты требуют аутентификации с ролью `student`.

- `GET /api/students/me` — профиль ученика
- `GET /api/students/me/courses` — курсы ученика
- `GET /api/students/me/lessons` — уроки
- `GET /api/students/me/homeworks` — домашние задания
- `GET /api/students/me/submissions` — отправленные ДЗ
- `GET /api/students/me/grades` — оценки
- `GET /api/students/me/ratings` — рейтинги уроков
- `GET /api/students/me/attendance` — посещаемость
- `GET /api/students/me/achievements` — достижения

---

### Родители

Все эндпоинты требуют аутентификации с ролью `parent`.

- `GET /api/parents/me` — профиль родителя
- `GET /api/parents/me/children` — список детей
- `GET /api/parents/children/:studentId/grades` — оценки ребёнка
- `GET /api/parents/children/:studentId/attendance` — посещаемость ребёнка

---

### Учителя

Все эндпоинты требуют аутентификации с ролью `teacher`.

- `GET /api/teachers/me` — профиль учителя
- `GET /api/teachers/me/students` — список учеников

---

### Общие данные

Требуют аутентификации для любой роли.

- `GET /api/contests` — список конкурсов
- `GET /api/events` — список мероприятий
- `GET /api/notifications` — уведомления пользователя
- `POST /api/notifications/:id/read` — отметить уведомление как прочитанное
- `GET /api/points` — баланс баллов
- `GET /api/points/transactions` — история транзакций баллов

---

## 🔐 Аутентификация

Используется JWT (JSON Web Token).

1. Клиент отправляет `POST /api/auth/login` с `identifier` и `password`
2. Сервер возвращает JWT токен
3. Клиент включает токен в заголовок `Authorization: Bearer <token>` для всех защищённых запросов
4. Сервер проверяет токен через middleware `authenticate`

**Время жизни токена:** настраивается в `.env` (`JWT_EXPIRES_IN`, по умолчанию 7 дней)

---

## 🗄️ Структура базы данных

API работает с PostgreSQL базой данных, созданной скриптами:

```
sql/
├── 01_schema.sql              — Создание таблиц
├── 02_seed_data.sql           — Тестовые данные
└── 03_triggers_and_seed.sql   — Триггеры и дополнительные данные
```

Основные таблицы:
- `users` — пользователи (ученики, родители, учителя)
- `students`, `parents`, `teachers` — профили
- `courses`, `course_lessons` — курсы и уроки
- `homeworks`, `homework_submissions` — домашние задания
- `grades`, `lesson_ratings` — оценки
- `attendance` — посещаемость
- `achievements` — достижения
- `contests`, `events` — конкурсы и мероприятия
- `notifications` — уведомления
- `points_accounts`, `points_transactions` — баллы

---

## 🛠️ Разработка

### Типизация

Все типы данных находятся в `src/types/index.ts`

### Добавление нового эндпоинта

1. Создайте роут в `src/routes/`
2. Импортируйте и зарегистрируйте в `src/index.ts`
3. Добавьте типы в `src/types/index.ts`

Пример:
```typescript
// src/routes/example.ts
import { FastifyInstance } from 'fastify';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';

export default async function exampleRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/example', async (request, reply) => {
    const data = await sql`SELECT * FROM example_table`;
    return { success: true, data };
  });
}

// src/index.ts
import exampleRoutes from './routes/example';
fastify.register(exampleRoutes, { prefix: '/api/example' });
```

### Логирование

Используется `pino` с `pino-pretty` для красивых логов в development режиме.

```typescript
fastify.log.info('Информационное сообщение');
fastify.log.error('Ошибка');
```

---

## 🌐 Подключение мобильного приложения

### Изменение конфигурации

В файле `.env` мобильного приложения (или `src/config.ts`):

```bash
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000/api
```

### CORS

Для работы с мобильным приложением добавьте домен в `CORS_ORIGIN`:

```bash
# .env API сервера
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,capacitor://localhost
```

---

## 🚢 Production деплой

### 1. Сборка

```bash
npm run build
```

### 2. Переменные окружения

Создайте `.env` с production значениями:

```bash
NODE_ENV=production
DATABASE_HOST=your-production-db-host
DATABASE_PASSWORD=strong-password
JWT_SECRET=very-long-random-secret-key
CORS_ORIGIN=https://your-domain.com
```

### 3. Запуск

```bash
npm start
```

### 4. Reverse Proxy (Nginx)

Пример конфигурации Nginx:

```nginx
server {
    listen 80;
    server_name api.confucius.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. PM2 (процесс-менеджер)

```bash
npm install -g pm2
pm start dist/index.js --name confucius-api
pm save
pm startup
```

---

## 📝 Лицензия

MIT

---

## 👥 Команда

Школа Конфуция | 孔子学院
