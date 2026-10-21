# 📱 Сборка APK для Android

## 🚀 Пошаговая инструкция

### Шаг 1: Установка Capacitor (если ещё не установлен)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Шаг 2: Сборка веб-приложения

```bash
npm run build
```

### Шаг 3: Добавление Android платформы

```bash
npx cap add android
```

### Шаг 4: Синхронизация файлов

```bash
npx cap sync android
```

### Шаг 5: Сборка APK через командную строку

#### Вариант A: Debug APK (для тестирования)

```bash
cd android
./gradlew assembleDebug
```

APK будет в: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Вариант B: Release APK (для публикации)

```bash
cd android
./gradlew assembleRelease
```

APK будет в: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Шаг 6: Установка на устройство

```bash
# Через ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Или скопируйте APK на устройство и установите вручную
```

---

## 🔐 Подпись Release APK

Для публикации в Google Play нужно подписать APK:

### 1. Создание keystore

```bash
keytool -genkey -v -keystore release.keystore \
  -alias confucius \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 2. Настройка подписи

Создайте файл `android/keystore.properties`:

```properties
storeFile=../release.keystore
storePassword=ВАШ_ПАРОЛЬ
keyAlias=confucius
keyPassword=ВАШ_ПАРОЛЬ
```

### 3. Обновите `android/app/build.gradle`

Добавьте в секцию `android`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. Соберите подписанный APK

```bash
cd android
./gradlew assembleRelease
```

Подписанный APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🎨 Настройка иконок и Splash Screen

### Автоматическая генерация иконок

```bash
npm install -D @capacitor/assets

# Положите исходники:
# resources/icon.png (1024x1024)
# resources/splash.png (2732x2732)

npx capacitor-assets generate --android
npx cap sync android
```

### Ручная настройка

Иконки находятся в:
- `android/app/src/main/res/mipmap-*` - иконки приложения
- `android/app/src/main/res/drawable-*` - splash screen

---

## 📋 Быстрая команда для полной сборки

Создайте скрипт `build-apk.sh` (Linux/Mac) или `build-apk.bat` (Windows):

### Linux/Mac:

```bash
#!/bin/bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
echo "APK готов: android/app/build/outputs/apk/debug/app-debug.apk"
```

### Windows:

```batch
@echo off
npm run build
npx cap sync android
cd android
gradlew.bat assembleDebug
echo APK готов: android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 🧪 Тестирование APK

### Установка на эмулятор

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Установка на реальное устройство

1. Включите "Режим разработчика" на устройстве
2. Включите "Отладка по USB"
3. Подключите устройство через USB
4. Выполните:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📊 Размеры APK

- **Debug APK**: ~15-20 MB (с отладочной информацией)
- **Release APK**: ~10-15 MB (оптимизированный)
- **Release APK с ProGuard**: ~8-12 MB (минимизированный)

---

## 🐛 Решение проблем

### Проблема: "SDK location not found"

Создайте файл `android/local.properties`:

```properties
sdk.dir=C:\\Users\\ВАШ_ПОЛЬЗОВАТЕЛЬ\\AppData\\Local\\Android\\Sdk
```

Или для Linux/Mac:

```properties
sdk.dir=/home/ВАШ_ПОЛЬЗОВАТЕЛЬ/Android/Sdk
```

### Проблема: "Gradle sync failed"

```bash
cd android
./gradlew clean
./gradlew build
```

### Проблема: "Execution failed for task ':app:mergeDebugResources'"

```bash
cd android
./gradlew clean
rm -rf .gradle
rm -rf build
./gradlew assembleDebug
```

---

## 📦 Публикация в Google Play

1. Зарегистрируйтесь в [Google Play Console](https://play.google.com/console)
2. Создайте новое приложение
3. Загрузите подписанный AAB (не APK):

```bash
cd android
./gradlew bundleRelease
```

4. AAB будет в: `android/app/build/outputs/bundle/release/app-release.aab`
5. Заполните информацию о приложении
6. Отправьте на ревью

---

## ✅ Чек-лист перед сборкой

- [ ] Выполнен `npm run build`
- [ ] Выполнен `npx cap sync android`
- [ ] Настроены иконки приложения
- [ ] Настроен splash screen
- [ ] Для release: настроена подпись APK
- [ ] Протестировано на эмуляторе
- [ ] Протестировано на реальном устройстве

---

**Дата создания:** 2026-10-20  
**Версия приложения:** 1.0.0  
**Package ID:** ru.confucius.school
