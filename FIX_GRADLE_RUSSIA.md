# 🔧 Решение проблемы с блокировками в России

## Проблема

Gradle зависает при сборке, потому что пытается скачать зависимости из Google Maven и других зарубежных репозиториев, которые заблокированы или работают медленно в России.

## Решение: Обновлённые зеркала

Я создал конфигурацию с рабочими зеркалами:

### Рабочие зеркала:

1. **Tencent Cloud** - `https://mirrors.tencent.com/maven/` ✅
2. **Huawei Cloud** - `https://mirrors.huaweicloud.com/repository/maven/` ✅
3. **Aliyun** - `https://maven.aliyun.com/repository/` ⚠️ (может не работать)

### Обновлённые файлы:

- `android/build.gradle` - основная конфигурация с зеркалами
- `android/settings.gradle` - настройки репозиториев
- `android/init.gradle` - инициализационный скрипт
- `android/gradle.properties` - настройки таймаутов

## Инструкция по сборке

### Шаг 1: Очистите кэш Gradle

```cmd
cd android
gradlew.bat clean
```

### Шаг 2: Соберите с использованием init.gradle

```cmd
gradlew.bat assembleDebug --init-script init.gradle
```

### Шаг 3: Если не работает, используйте VPN

1. Включите VPN
2. Выполните сборку:
   ```cmd
   gradlew.bat assembleDebug
   ```
3. Дождитесь загрузки всех зависимостей (10-20 минут)
4. Отключите VPN
5. Повторите сборку (теперь зависимости в кэше)

## Альтернативные зеркала

Если Tencent и Huawei не работают, попробуйте:

### В `android/build.gradle` замените на:

```gradle
repositories {
    // 163 (NetEase)
    maven { url 'http://mirrors.163.com/maven/repository/' }
    
    // CSDN
    maven { url 'https://maven.csdn.net/repository/public/' }
    
    // JitPack (для GitHub проектов)
    maven { url 'https://jitpack.io' }
    
    // Оригинальные
    google()
    mavenCentral()
}
```

## Проверка работы зеркал

Проверьте доступность зеркал в браузере:

- ✅ Tencent: https://mirrors.tencent.com/maven/
- ✅ Huawei: https://mirrors.huaweicloud.com/repository/maven/
- ⚠️ Aliyun: https://maven.aliyun.com/repository/public

## Если ничего не работает

### Используйте прокси

В `android/gradle.properties` добавьте:

```properties
# Ваш прокси/VPN
systemProp.http.proxyHost=127.0.0.1
systemProp.http.proxyPort=7890
systemProp.https.proxyHost=127.0.0.1
systemProp.https.proxyPort=7890
```

Замените `7890` на порт вашего прокси.

### Очистите весь кэш Gradle

```cmd
# Windows
cd %USERPROFILE%
rmdir /s /q .gradle

# Затем повторите сборку с VPN
```

## Быстрое решение

Самый надёжный способ:

1. **Включите VPN**
2. **Очистите проект:**
   ```cmd
   cd android
   gradlew.bat clean
   ```
3. **Соберите с VPN:**
   ```cmd
   gradlew.bat assembleDebug
   ```
4. **Дождитесь завершения** (10-20 минут)
5. **Отключите VPN**
6. **Повторите сборку** (теперь работает без VPN)

## Проверка результата

После успешной сборки APK будет в:

```
android\app\build\outputs\apk\debug\app-debug.apk
```

## Полезные команды

```cmd
# Показать статус Gradle
gradlew.bat --status

# Остановить все Gradle процессы
gradlew.bat --stop

# Очистить проект
gradlew.bat clean

# Собрать с подробным логом
gradlew.bat assembleDebug --info --stacktrace

# Собрать без кэша
gradlew.bat assembleDebug --no-build-cache --refresh-dependencies
```

## Контакты

Если проблема не решена:
- Проверьте логи: `android\build\reports\problems\problems-report.html`
- Запустите с `--debug` для подробной информации
- Проверьте интернет-соединение
- Попробуйте другой VPN/прокси

---

**Дата обновления:** 2026-10-20  
**Рабочие зеркала:** Tencent Cloud, Huawei Cloud  
**Проблема:** Блокировки Google Maven в России
