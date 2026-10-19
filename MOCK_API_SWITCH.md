# 🔧 Переключение между MOCK и API режимами

## 📍 Где находится флаг

Флаг `USE_MOCK` находится в **трёх местах** (по приоритету):

### 1. **localStorage** (высший приоритет)
Для переопределения на устройстве без пересборки:

```javascript
// В консоли браузера или устройства:
localStorage.setItem('confucius_use_mock', 'true')   // Включить MOCK
localStorage.setItem('confucius_use_mock', 'false')  // Выключить MOCK
localStorage.removeItem('confucius_use_mock')        // Сбросить к значению по умолчанию

// После изменения нужно перезагрузить приложение
```

### 2. **Переменная окружения** `.env` (средний приоритет)
Файл `.env` в корне проекта:

```bash
# Режим работы с данными:
#   true  = использовать MOCK-данные (локально, без сервера)
#   false = использовать реальный API (Supabase или REST)
VITE_USE_MOCK=true
```

**Важно:** После изменения `.env` нужно перезапустить dev-сервер:
```bash
npm run dev
```

### 3. **Значение по умолчанию** в `src/config.ts` (низший приоритет)
```typescript
const DEFAULT_USE_MOCK = true;  // Измените здесь для продакшена
```

---

## 🎯 Как переключить режим

### Способ 1: Через `.env` файл (рекомендуется для разработки)

```bash
# 1. Открыть файл .env
# 2. Изменить строку:
VITE_USE_MOCK=false  # Для реального API
# или
VITE_USE_MOCK=true   # Для MOCK-данных

# 3. Перезапустить dev-сервер
npm run dev
```

### Способ 2: Через консоль браузера (для тестирования на устройстве)

```javascript
// Включить MOCK режим
localStorage.setItem('confucius_use_mock', 'true')
location.reload()

// Выключить MOCK режим (использовать API)
localStorage.setItem('confucius_use_mock', 'false')
location.reload()
```

### Способ 3: Через код (для продакшена)

В файле `src/config.ts` измените:
```typescript
const DEFAULT_USE_MOCK = false;  // Для продакшена
```

---

## 📊 Архитектура

```
src/
├── config.ts                      ← Флаг USE_MOCK и конфигурация
├── services/
│   ├── api.types.ts              ← Интерфейс IApiService
│   ├── MockApiService.ts         ← Реализация на MOCK-данных
│   ├── SupabaseApiService.ts     ← Реализация на Supabase (заглушка)
│   └── index.ts                  ← Фабрика: возвращает нужный сервис
├── contexts/
│   └── AppContext.tsx            ← Использует api из services/index.ts
└── data/
    └── mock.ts                   ← MOCK-данные (используются только в MockApiService)
```

---

## 🔄 Как это работает

### 1. При старте приложения
```typescript
// src/config.ts
export const USE_MOCK = getUseMock();  // Определяет режим

// src/services/index.ts
export const api = getApiService();  // Создаёт нужный сервис
```

### 2. В коде приложения
```typescript
// src/contexts/AppContext.tsx
import { api } from '../services';

const login = async (username: string, password: string) => {
  const response = await api.login(username, password);  // Работает с любым режимом
  // ...
};
```

### 3. Фабрика выбирает реализацию
```typescript
// src/services/index.ts
export function getApiService(): IApiService {
  if (USE_MOCK) {
    return new MockApiService();      // Локальные данные
  } else {
    return new SupabaseApiService();  // Реальный сервер
  }
}
```

---

## 🌐 Настройка реального API (Supabase)

Когда будете готовы подключить реальный сервер:

### 1. Установить Supabase client
```bash
npm install @supabase/supabase-js
```

### 2. Настроить `.env`
```bash
VITE_USE_MOCK=false
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Реализовать методы в `SupabaseApiService.ts`
Все методы помечены `TODO` с примерами кода. Раскомментируйте и адаптируйте под вашу схему БД.

### 4. Выполнить SQL-скрипты
```bash
psql -U postgres -d confucius_school -f sql/01_schema.sql
psql -U postgres -d confucius_school -f sql/02_seed_data.sql
psql -U postgres -d confucius_school -f sql/03_triggers_and_seed.sql
```

---

## 🧪 Тестирование

### Проверка текущего режима
В консоли браузера:
```javascript
import { getMockModeStatus } from './src/config';
console.log(getMockModeStatus());
// { current: true, source: 'localStorage', envValue: 'true' }
```

### Логи при старте
При запуске приложения в консоли будет:
```
╔═══════════════════════════════════════════════════════════╗
║  Школа Конфуция | 孔子学院                                ║
╠═══════════════════════════════════════════════════════════╣
║  Режим данных: 🔧 MOCK (локальные данные)
║  Источник: env
╚═══════════════════════════════════════════════════════════╝
```

---

## 📝 Чек-лист переключения

### Переключение на реальный API:
- [ ] Изменить `VITE_USE_MOCK=false` в `.env`
- [ ] Установить `@supabase/supabase-js`
- [ ] Настроить `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`
- [ ] Реализовать методы в `SupabaseApiService.ts`
- [ ] Выполнить SQL-скрипты на сервере
- [ ] Перезапустить dev-сервер
- [ ] Проверить работу всех экранов

### Возврат к MOCK режиму:
- [ ] Изменить `VITE_USE_MOCK=true` в `.env`
- [ ] Перезапустить dev-сервер
- [ ] Проверить работу всех экранов

---

## ⚠️ Важные моменты

1. **Приоритет источников:**
   - `localStorage` > `VITE_USE_MOCK` > `DEFAULT_USE_MOCK`

2. **Перезагрузка требуется:**
   - После изменения `.env` — перезапустить `npm run dev`
   - После изменения `localStorage` — перезагрузить страницу

3. **Типизация:**
   - Все методы API возвращают `Promise<T>`
   - Интерфейс `IApiService` гарантирует одинаковую сигнатуру для всех реализаций

4. **Обработка ошибок:**
   - `MockApiService` — минимальные задержки для имитации сети
   - `SupabaseApiService` — реальные ошибки от Supabase
   - Все ошибки оборачиваются в `ApiError`, `AuthError`, `NetworkError`

---

## 🚀 Быстрый старт

```bash
# 1. MOCK режим (по умолчанию)
npm run dev
# Приложение работает с локальными данными

# 2. Переключить на API
# Изменить .env: VITE_USE_MOCK=false
npm run dev
# Приложение работает с реальным сервером

# 3. Вернуться к MOCK
# Изменить .env: VITE_USE_MOCK=true
npm run dev
# Снова локальные данные
```

---

## 📚 Дополнительная информация

- **Файл конфигурации:** `src/config.ts`
- **Интерфейс API:** `src/services/api.types.ts`
- **MOCK реализация:** `src/services/MockApiService.ts`
- **Supabase реализация:** `src/services/SupabaseApiService.ts`
- **Фабрика сервисов:** `src/services/index.ts`
