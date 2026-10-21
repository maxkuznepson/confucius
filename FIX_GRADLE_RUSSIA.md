# 🔧 Решение проблемы с блокировками в России

## Проблема

Gradle зависает при сборке на 77%, потому что пытается скачать зависимости из Google Maven и других зарубежных репозиториев, которые заблокированы или работают медленно в России.

## Решение 1: Настройка зеркал репозиториев

### Шаг 1: Создайте файл `android/gradle.properties`

```properties
# Использование зеркал репозиториев
systemProp.gradle.repo=https://maven.aliyun.com/repository/public
systemProp.gradle.plugin.repo=https://maven.aliyun.com/repository/gradle-plugin

# Отключение проверки сертификатов (если есть проблемы)
systemProp.javax.net.ssl.trustStoreType=Windows-ROOT

# Увеличение таймаутов
systemProp.http.connectionTimeout=60000
systemProp.http.socketTimeout=60000
systemProp.org.gradle.internal.http.connectionTimeout=60000
systemProp.org.gradle.internal.http.socketTimeout=60000
systemProp.org.gradle.internal.http.idleConnectionTimeout=60000
```

### Шаг 2: Отредактируйте `android/build.gradle`

Добавьте в начало файла (после `buildscript {`):

```gradle
buildscript {
    repositories {
        // Китайские зеркала (работают в России)
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        
        // Российские зеркала
        maven { url 'https://mirror.yandex.ru/maven/central/' }
        
        // Оригинальные репозитории (если зеркала не работают)
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath 'com.google.gms:google-services:4.4.0'
    }
}

allprojects {
    repositories {
        // Китайские зеркала
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/google' }
        
        // Российские зеркала
        maven { url 'https://mirror.yandex.ru/maven/central/' }
        
        // Оригинальные репозитории
        google()
        mavenCentral()
    }
}
```

### Шаг 3: Отредактируйте `android/settings.gradle`

```gradle
pluginManagement {
    repositories {
        // Китайские зеркала
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        
        // Оригинальные
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        // Китайские зеркала
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/google' }
        
        // Российские зеркала
        maven { url 'https://mirror.yandex.ru/maven/central/' }
        
        // Оригинальные
        google()
        mavenCentral()
    }
}
```

## Решение 2: Использование прокси

Если у вас есть VPN или прокси, настройте его для Gradle:

### В `android/gradle.properties`:

```properties
# HTTP прокси
systemProp.http.proxyHost=127.0.0.1
systemProp.http.proxyPort=7890

# HTTPS прокси
systemProp.https.proxyHost=127.0.0.1
systemProp.https.proxyPort=7890

# Исключения (не использовать прокси для локальных адресов)
systemProp.http.nonProxyHosts=localhost|127.0.0.1|10.*|192.168.*
```

Замените `7890` на порт вашего прокси/VPN.

## Решение 3: Предварительная загрузка зависимостей

### Шаг 1: Включите VPN/прокси

### Шаг 2: Запустите сборку один раз

```bash
cd android
gradlew.bat assembleDebug
```

Дождитесь, пока все зависимости загрузятся (может занять 10-20 минут).

### Шаг 3: Отключите VPN и повторите сборку

Теперь все зависимости должны быть в кэше Gradle:
```
C:\Users\ВАШ_ПОЛЬЗОВАТЕЛЬ\.gradle\caches\
```

Повторная сборка будет работать без VPN.

## Решение 4: Использование Android Studio

Вместо командной строки используйте Android Studio:

1. Откройте проект в Android Studio
2. **File → Settings → Build, Execution, Deployment → Build Tools → Gradle**
3. Включите **"Use Gradle from: 'gradle-wrapper.properties'"**
4. Нажмите **Sync Now**
5. Android Studio покажет прогресс и ошибки

## Решение 5: Очистка кэша Gradle

Если ничего не помогает, очистите кэш:

```bash
# Windows
cd %USERPROFILE%
rmdir /s /q .gradle

# Linux/Mac
rm -rf ~/.gradle
```

Затем повторите сборку с VPN.

## Решение 6: Альтернативные зеркала

### Tencent Cloud (Китай):
```gradle
maven { url 'https://mirrors.cloud.tencent.com/nexus/repository/maven-public/' }
```

### Huawei Cloud (Китай):
```gradle
maven { url 'https://developer.huawei.com/repo/' }
```

### JitPack (для GitHub проектов):
```gradle
maven { url 'https://jitpack.io' }
```

## Быстрое решение (копипаст)

Создайте файл `android/init.gradle`:

```gradle
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        maven { url 'https://mirror.yandex.ru/maven/central/' }
        google()
        mavenCentral()
    }
    buildscript {
        repositories {
            maven { url 'https://maven.aliyun.com/repository/public' }
            maven { url 'https://maven.aliyun.com/repository/google' }
            maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
            maven { url 'https://mirror.yandex.ru/maven/central/' }
            google()
            mavenCentral()
        }
    }
}
```

Запустите сборку с этим файлом:

```bash
gradlew.bat assembleDebug --init-script init.gradle
```

## Проверка работы

После настройки зеркал проверьте:

```bash
cd android
gradlew.bat --refresh-dependencies
gradlew.bat assembleDebug
```

## Если ничего не помогает

1. **Используйте VPN** (обязательно для первой сборки)
2. **Увеличьте таймауты** в `gradle.properties`
3. **Очистите кэш** Gradle
4. **Обновите Gradle** до последней версии
5. **Используйте Android Studio** вместо командной строки

## Полезные команды

```bash
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

## Рекомендуемый порядок действий

1. ✅ Создайте `android/init.gradle` с зеркалами
2. ✅ Добавьте `gradle.properties` с таймаутами
3. ✅ Включите VPN
4. ✅ Запустите `gradlew.bat assembleDebug --init-script init.gradle`
5. ✅ Дождитесь завершения (10-20 минут)
6. ✅ Отключите VPN
7. ✅ Повторите сборку (должна работать быстро)

## Контакты поддержки

Если проблема не решена:
- Проверьте логи: `android/build/reports/problems/problems-report.html`
- Запустите с `--debug` для подробной информации
- Проверьте интернет-соединение
- Попробуйте другой VPN/прокси

---

**Дата создания:** 2026-10-20  
**Проблема:** Блокировки Google Maven в России  
**Решение:** Использование китайских и российских зеркал репозиториев
