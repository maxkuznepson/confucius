#!/usr/bin/env python3
"""
Генератор bcrypt-хэшей для паролей
Использование: python3 generate_password_hash.py
"""

import bcrypt

def generate_hash(password: str = "123") -> str:
    """Генерирует bcrypt-хэш для пароля"""
    # Кодируем пароль в байты
    password_bytes = password.encode('utf-8')
    
    # Генерируем соль и хэшируем
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    return hashed.decode('utf-8')

def main():
    password = "123"
    hash_value = generate_hash(password)
    
    print("=" * 70)
    print("Генератор bcrypt-хэшей для паролей")
    print("=" * 70)
    print()
    print(f"Пароль: {password}")
    print(f"Bcrypt хэш: {hash_value}")
    print(f"Длина хэша: {len(hash_value)} символов")
    print()
    print("SQL команда для обновления всех пользователей:")
    print("-" * 70)
    print(f"UPDATE users SET password_hash = '{hash_value}' WHERE password_hash = '123';")
    print()
    print("SQL команда для обновления одного пользователя:")
    print("-" * 70)
    print(f"UPDATE users SET password_hash = '{hash_value}' WHERE username = 'student1';")
    print()
    print("Проверка хэша:")
    print("-" * 70)
    print(f"SELECT crypt('123', password_hash) = password_hash as valid FROM users WHERE username = 'student1';")
    print()
    print("=" * 70)

if __name__ == "__main__":
    main()
