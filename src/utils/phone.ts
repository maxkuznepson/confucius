// Утилита для форматирования телефона в маску +7-NNN-NNN-NNNN

export function formatPhone(value: string): string {
  // Убираем всё кроме цифр
  const digits = value.replace(/\D/g, '');
  
  // Если пустая строка, возвращаем дефолт
  if (digits.length === 0) {
    return '+7-999-888-0002';
  }
  
  // Если начинается с 8, заменяем на 7
  let normalized = digits;
  if (normalized.startsWith('8')) {
    normalized = '7' + normalized.slice(1);
  }
  
  // Если не начинается с 7, добавляем 7
  if (!normalized.startsWith('7')) {
    normalized = '7' + normalized;
  }
  
  // Ограничиваем до 11 цифр
  normalized = normalized.slice(0, 11);
  
  // Форматируем: +7-NNN-NNN-NNNN
  let result = '+' + normalized.slice(0, 1);
  
  if (normalized.length > 1) {
    result += '-' + normalized.slice(1, 4);
  }
  
  if (normalized.length > 4) {
    result += '-' + normalized.slice(4, 7);
  }
  
  if (normalized.length > 7) {
    result += '-' + normalized.slice(7, 11);
  }
  
  return result;
}

// Извлечь только цифры из отформатированного телефона
export function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

// Валидация телефона
export function isValidPhone(value: string): boolean {
  const digits = extractDigits(value);
  return digits.length === 11 && digits.startsWith('7');
}

// Получить дефолтный телефон
export function getDefaultPhone(): string {
  return '+7-999-888-0002';
}
