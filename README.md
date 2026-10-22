# 🏯 Школа Конфуция | 孔子学院

Полноценная система управления школой китайского языка: мобильное приложение + REST API + PostgreSQL.

## 📋 Архитектура

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Мобильное      │  HTTP   │  REST API       │  SQL    │  PostgreSQL     │
│  приложение     │ ◄─────► │  (Node.js)      │ ◄─────► │  (БД)           │
│  (React + Vite) │  JSON   │  (Fastify)      │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     Порт 5173                Порт 3000                  Порт 5432
```

## 🎯 Возможности

### Роли пользователей
- **Ученик** — просмотр курсов, ДЗ, оценок, достижений
- **Родитель** — контроль успеваемости детей, оплата, мероприятия
- **Учитель** — управление учениками, оценки, посещаемость

### Функционал
- ✅ Двуязычный интерфейс (русский/китайский)
- ✅ Светлая и тёмная темы
- ✅ Аутентификация по email/телефону
- ✅ JWT токены
- ✅ Курсы, уроки, домашние задания
- ✅ Оценки и рейтинги
- ✅ Посещаемость
- ✅ Достижения и сертификаты
- ✅ Конкурсы и мероприятия
- ✅ Уведомления
- ✅ Система баллов

## 🚀 Быстрый старт

### 1. Установка PostgreSQL

Убедитесь, что PostgreSQL запущен и создайте базу данных:

```bash
createdb confucius_school
```

### 2. Выполнить SQL скрипты

```bash
psql -U postgres -d confucius_school -f sql/01_schema.sql
psql -U postgres -d confucius_school -f sql/02_seed_data.sql
psql -U postgres -d confucius_school -f sql/03_triggers_and_seed.sql
```

### 3. Запуск API сервера

```bash
cd api
npm install
npm run dev
```

API сервер запустится на `http://localhost:3000`

### 4. Запуск мобильного приложения

```bash
# В корне проекта
npm install
npm run dev
```

Мобильное приложение запустится на `http://localhost:5173`

### 5. Вход в систему

**Тестовые аккаунты:**

| Роль | Email | Телефон | Пароль |
|------|-------|---------|--------|
| Ученик | student1@confucius.ru | +79998880001 | 123 |
| Родитель | parent1@confucius.ru | +79998880003 | 123 |
| Учитель | teacher1@confucius.ru | +79998880100 | 123 |

## 📁 Структура проекта

```
confucius-school/
├── api/                          # REST API сервер
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts      # Подключение к PostgreSQL
│   │   ├── routes/
│   │   │   ├── auth.ts          # Аутентификация
│   │   │   ├── students.ts      # API для учеников
│   │   │   ├── parents.ts       # API для родителей
│   │   │   ├── teachers.ts      # API для учителей
│   │   │   └── common.ts        # Общие эндпоинты
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT аутентификация
│   │   ├── types/
│   │   │   └── index.ts         # Типы данных
│   │   └── index.ts             # Точка входа
│   ├── .env                     # Конфигурация API
│   └── package.json
│
├── src/                          # Мобильное приложение
│   ├── components/
│   │   └── TopAppBar.tsx        # Верхняя панель
│   ├── contexts/
│   │   └── AppContext.tsx       # Глобальное состояние
│   ├── data/
│   │   └── mock.ts              # MOCK данные
│   ├── i18n/
│   │   └── translations.ts     # Переводы RU/ZH
│   ├── pages/
│   │   ├── LoginPage.tsx        # Вход
│   │   ├── RegisterPage.tsx     # Регистрация
│   │   ├── StudentPage.tsx      # Рабочее место ученика
│   │   ├── ParentPage.tsx       # Рабочее место родителя
│   │   └── TeacherPage.tsx      # Рабочее место учителя
│   ├── services/
│   │   ├── api.types.ts         # Интерфейс API
│   │   ├── MockApiService.ts    # MOCK реализация
│   │   ├── RestApiService.ts    # REST API реализация
│   │   └── index.ts             # Фабрика сервисов
│   ├── utils/
│   │   └── phone.ts             # Маска телефона
│   ├── config.ts                # Конфигурация (USE_MOCK)
│   ├── App.tsx                  # Главный компонент
│   └── main.tsx                 # Точка входа
│
├── sql/                          # SQL скрипты
│   ├── 01_schema.sql            # Создание таблиц
│   ├── 02_seed_data.sql         # Тестовые данные
│   └── 03_triggers_and_seed.sql # Триггеры и доп. данные
│
├── .env                          # Конфигурация приложения
├── MOCK_API_SWITCH.md            # Документация переключения
└── API_INTEGRATION.md            # Документация интеграции
```

## 🔧 Режимы работы

### MOCK режим (локальные данные)

```bash
# .env
VITE_USE_MOCK=true
```

Приложение работает с локальными MOCK данными без необходимости API сервера.

### API режим (реальный сервер)

```bash
# .env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000/api
```

Приложение работает с REST API сервером и PostgreSQL базой данных.

**Переключение:** Измените `VITE_USE_MOCK` в `.env` и перезапустите dev-сервер.

## 📊 Тестовые данные

### Пользователи
- **60 учеников** (student1..student60)
- **60 родителей** (parent1..parent60)
- **10 учителей** (teacher1..teacher10)

### Классы
- **6 классов** (A-1, A-2, B-1, B-2, C-1, C-2)
- **10 учеников в каждом классе**

### Телефоны (формула)
```
Ученик 1: +7999888(3n+1)    → 0001, 0004, 0007, ...
Ученик 2: +7999888(3n+2)    → 0002, 0005, 0008, ...
Родитель: +7999888(3n+3)    → 0003, 0006, 0009, ...
Учитель:  +7999888(100n+100) → 0100, 0200, ..., 1000
```

### Email
```
Ученики:  studentN@confucius.ru
Родители: parentN@confucius.ru
Учителя:  teacherN@confucius.ru
```

**Пароль у всех:** `123`

## 📡 API Endpoints

### Аутентификация
- `POST /api/auth/login` — Вход
- `POST /api/auth/register` — Регистрация
- `GET /api/auth/me` — Текущий пользователь

### Ученики
- `GET /api/students/me` — Профиль
- `GET /api/students/me/courses` — Курсы
- `GET /api/students/me/grades` — Оценки
- `GET /api/students/me/attendance` — Посещаемость
- `GET /api/students/me/achievements` — Достижения

### Родители
- `GET /api/parents/me` — Профиль
- `GET /api/parents/me/children` — Дети
- `GET /api/parents/children/:id/grades` — Оценки ребёнка

### Учителя
- `GET /api/teachers/me` — Профиль
- `GET /api/teachers/me/students` — Ученики

### Общие
- `GET /api/contests` — Конкурсы
- `GET /api/events` — Мероприятия
- `GET /api/notifications` — Уведомления
- `GET /api/points` — Баллы

## 🎨 Интерфейс

### Переключение языков
Кнопка 🌐 в правом верхнем углу каждого экрана

### Переключение темы
Кнопка ☀️/🌙 в правом верхнем углу каждого экрана

### Цветовая палитра
- **Светлая тема:** Жёлтый фон (#FFF3C4), красный акцент (#D32F2F)
- **Тёмная тема:** Тёмно-коричневый (#1A1410), тёмно-красный (#8B1A1A)

## 📱 Мобильная разработка

### Capacitor (Android/iOS)

```bash
# Сборка
npm run build
npx cap sync

# Android
npx cap open android

# iOS
npx cap open ios
```

### Live Reload (для разработки)

```bash
# 1. Запустить dev-сервер с доступом из локальной сети
npm run dev -- --host

# 2. В capacitor.config.json:
{
  "server": {
    "url": "http://192.168.1.100:5173",
    "cleartext": true
  }
}

# 3. Синхронизировать
npx cap sync
npx cap run android
```

## 🌐 Production деплой

### API сервер

```bash
cd api
npm run build
npm start
```

Настройте `.env`:
```bash
NODE_ENV=production
DATABASE_HOST=your-db-host
JWT_SECRET=very-long-random-secret
CORS_ORIGIN=https://your-domain.com
```

### Мобильное приложение

```bash
npm run build
```

Настройте `.env`:
```bash
VITE_USE_MOCK=false
VITE_API_URL=https://api.confucius.ru
```

### Деплой на Vercel

```bash
npm install -g vercel
vercel --prod
```

### Деплой Android/iOS

```bash
npx cap sync android
npx cap open android
# Build → Generate Signed Bundle → Google Play
```

## 📚 Документация

- **API_INTEGRATION.md** — Интеграция API с мобильным приложением
- **MOCK_API_SWITCH.md** — Переключение между MOCK и API режимами
- **api/README.md** — Документация REST API сервера

## 🛠️ Технологии

### Мобильное приложение
- **React 18** — UI фреймворк
- **TypeScript** — Типизация
- **Vite** — Сборщик
- **Tailwind CSS** — Стили
- **Capacitor** — Мобильная оболочка

### API сервер
- **Node.js** — Runtime
- **Fastify** — Web фреймворк
- **PostgreSQL** — База данных
- **JWT** — Аутентификация
- **TypeScript** — Типизация

### База данных
- **PostgreSQL 14+** — СУБД
- **PL/pgSQL** — Триггеры и функции
- **UUID** — Идентификаторы

## 🔐 Безопасность

- ✅ JWT токены с ограниченным временем жизни
- ✅ Хеширование паролей (bcrypt)
- ✅ CORS настройка
- ✅ Валидация входных данных (zod)
- ✅ Защита от SQL инъекций (postgres.js)
- ✅ Ролевая модель доступа

## 📝 Лицензия

MIT

---

**Школа Конфуция | 孔子学院** 🏯
