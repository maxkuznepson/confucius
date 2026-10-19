// Утилита для форматирования телефона в маску +7-NNN-NNN-NNNN

// Форматирование для отображения: +79998880001 -> +7-999-888-0001
export function formatPhoneDisplay(value: string): string {
  // Убираем всё кроме цифр
  const digits = value.replace(/\D/g, '');
  
  // Если не начинается с 7, добавляем
  let normalized = digits;
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

// Обработка ввода для маски телефона
// Принимает текущее значение и новое, возвращает отформатированное
export function formatPhoneInput(currentValue: string, newValue: string): string {
  // Извлекаем цифры из нового значения
  let digits = newValue.replace(/\D/g, '');
  
  // Если пользователь пытается удалить +7, возвращаем дефолт
  if (digits.length === 0) {
    return '+7-999-888-0002';
  }
  
  // Если не начинается с 7, добавляем
  if (!digits.startsWith('7')) {
    digits = '7' + digits;
  }
  
  // Ограничиваем до 11 цифр
  digits = digits.slice(0, 11);
  
  // Форматируем с дефисами
  return formatPhoneDisplay(digits);
}

// Извлечь только цифры из телефона
export function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

// Валидация телефона
export function isValidPhone(value: string): boolean {
  const digits = extractDigits(value);
  return digits.length === 11 && digits.startsWith('7');
}

// Получить дефолтный телефон (для отображения)
export function getDefaultPhone(): string {
  return '+7-999-888-0002';
}

// Получить дефолтный телефон (для хранения)
export function getDefaultPhoneRaw(): string {
  return '79998880002';
}
