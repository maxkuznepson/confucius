// ============================================================================
// Конфигурация приложения
// ============================================================================

/**
 * ФЛАГ ИСПОЛЬЗОВАНИЯ MOCK-ДАННЫХ
 * ================================
 * 
 * Где находится:
 *   1. Переменная окружения VITE_USE_MOCK (файл .env)
 *   2. localStorage ключ 'confucius_use_mock' (для переопределения на устройстве)
 * 
 * Как переключить:
 *   Способ 1: Изменить .env файл:
 *     VITE_USE_MOCK=true   — использовать MOCK-данные (без сервера)
 *     VITE_USE_MOCK=false  — использовать реальный API (Supabase)
 *   
 *   Способ 2: В консоли браузера/устройства:
 *     localStorage.setItem('confucius_use_mock', 'true')   — включить MOCK
 *     localStorage.setItem('confucius_use_mock', 'false')  — выключить MOCK
 *     // После этого нужно перезагрузить приложение
 *   
 *   Способ 3: В коде (для разработки):
 *     Изменить значение по умолчанию ниже
 * 
 * Приоритет:
 *   localStorage > VITE_USE_MOCK > значение по умолчанию (true)
 */

// Значение по умолчанию (если не задано в env и localStorage)
const DEFAULT_USE_MOCK = true;

function getUseMock(): boolean {
  // 1. Проверяем localStorage (приоритет выше)
  try {
    const localValue = localStorage.getItem('confucius_use_mock');
    if (localValue !== null) {
      return localValue === 'true';
    }
  } catch (e) {
    // localStorage может быть недоступен
  }
  
  // 2. Проверяем переменную окружения Vite
  const envValue = import.meta.env.VITE_USE_MOCK;
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1';
  }
  
  // 3. Возвращаем значение по умолчанию
  return DEFAULT_USE_MOCK;
}

export const USE_MOCK = getUseMock();

// ============================================================================
// Конфигурация Supabase (используется когда USE_MOCK = false)
// ============================================================================

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
};

// ============================================================================
// Конфигурация API (альтернатива Supabase — REST API)
// ============================================================================

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.confucius.ru',
  timeout: 30000,
};

// ============================================================================
// Утилиты для управления флагом
// ============================================================================

export function setMockMode(enabled: boolean): void {
  try {
    localStorage.setItem('confucius_use_mock', String(enabled));
  } catch (e) {
    console.warn('Не удалось сохранить настройку в localStorage');
  }
}

export function clearMockMode(): void {
  try {
    localStorage.removeItem('confucius_use_mock');
  } catch (e) {
    console.warn('Не удалось очистить настройку из localStorage');
  }
}

export function getMockModeStatus(): {
  current: boolean;
  source: 'localStorage' | 'env' | 'default';
  envValue: string | undefined;
} {
  try {
    const localValue = localStorage.getItem('confucius_use_mock');
    if (localValue !== null) {
      return {
        current: localValue === 'true',
        source: 'localStorage',
        envValue: import.meta.env.VITE_USE_MOCK,
      };
    }
  } catch (e) {}
  
  const envValue = import.meta.env.VITE_USE_MOCK;
  if (envValue !== undefined) {
    return {
      current: envValue === 'true' || envValue === '1',
      source: 'env',
      envValue,
    };
  }
  
  return {
    current: DEFAULT_USE_MOCK,
    source: 'default',
    envValue: undefined,
  };
}

// ============================================================================
// Логирование при старте
// ============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Школа Конфуция | 孔子学院                                ║
╠═══════════════════════════════════════════════════════════╣
║  Режим данных: ${USE_MOCK ? '🔧 MOCK (локальные данные)' : '🌐 API (реальный сервер)'}
║  Источник: ${getMockModeStatus().source}
${USE_MOCK ? '' : `║  API URL: ${API_CONFIG.baseUrl}
║  Supabase: ${SUPABASE_CONFIG.url}`}
╚═══════════════════════════════════════════════════════════╝
`);
