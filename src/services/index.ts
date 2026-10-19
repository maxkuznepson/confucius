/**
 * API Service Factory
 * 
 * Возвращает нужный API сервис в зависимости от флага USE_MOCK.
 * 
 * Использование:
 *   import { api } from './services';
 *   const user = await api.login('student1@confucius.ru', '123');
 */

import { USE_MOCK } from '../config';
import type { IApiService } from './api.types';
import { MockApiService } from './MockApiService';
import { SupabaseApiService } from './SupabaseApiService';

// Singleton экземпляр API сервиса
let apiInstance: IApiService | null = null;

/**
 * Получить экземпляр API сервиса
 */
export function getApiService(): IApiService {
  if (!apiInstance) {
    if (USE_MOCK) {
      console.log('[API Factory] Using MockApiService');
      apiInstance = new MockApiService();
    } else {
      console.log('[API Factory] Using SupabaseApiService');
      apiInstance = new SupabaseApiService();
    }
  }
  return apiInstance;
}

/**
 * Сбросить экземпляр API сервиса (для тестирования)
 */
export function resetApiService(): void {
  apiInstance = null;
}

// Экспортируем готовый экземпляр для удобства использования
export const api = getApiService();

// Re-export типов
export type { IApiService } from './api.types';
export { ApiError, AuthError, NetworkError } from './api.types';
