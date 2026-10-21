import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { TopAppBar } from '../components/TopAppBar';

type Tab = 'error' | 'cause' | 'fix' | 'files';

export function BuildFixPage() {
  const { darkMode } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('error');
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const bgClass = darkMode ? 'bg-[#1A1410] text-[#F5E6D3]' : 'bg-[#FFF3C4] text-[#212121]';
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';
  const codeBg = darkMode ? 'bg-[#1a1a2e] text-green-300' : 'bg-[#1e1e2e] text-green-300';
  const tabActive = 'bg-red-700 text-white';
  const tabInactive = darkMode ? 'bg-[#3A3028] text-gray-300' : 'bg-gray-200 text-gray-700';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBlock(id);
      setTimeout(() => setCopiedBlock(null), 2000);
    });
  };

  const variablesGradle = `// android/variables.gradle — ДОБАВЬТЕ ЭТОТ ФАЙЛ

ext {
    // SDK версии
    minSdkVersion = 22
    compileSdkVersion = 34
    targetSdkVersion = 34
    
    // AndroidX библиотеки
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    coreSplashScreenVersion = '1.0.1'
    
    // Тестирование
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
}`;

  const buildGradleWithApply = `// android/build.gradle — ДОБАВЬТЕ apply в начало

// ✅ Добавьте эту строку в самом начале файла:
apply from: "variables.gradle"

buildscript {
    ext {
        // Или определите переменные здесь:
        minSdkVersion = 22
        compileSdkVersion = 34
        targetSdkVersion = 34
        androidxAppCompatVersion = '1.6.1'
        androidxCoordinatorLayoutVersion = '1.2.0'
        androidxCoreVersion = '1.12.0'
        coreSplashScreenVersion = '1.0.1'
        junitVersion = '4.13.2'
        androidxJunitVersion = '1.1.5'
        androidxEspressoCoreVersion = '3.5.1'
    }
    
    repositories {
        google()
        mavenCentral()
    }
    
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.1'
        classpath 'com.google.gms:google-services:4.4.0'
    }
}

// ... остальной код`;

  const appBuildGradleFixed = `// android/app/build.gradle — ИСПРАВЛЕННАЯ ВЕРСИЯ

apply plugin: 'com.android.application'

android {
    namespace = "ru.confucius.school"
    compileSdk = rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "ru.confucius.school"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    
    // ✅ Используйте rootProject.ext. для всех переменных
    implementation "androidx.appcompat:appcompat:\${rootProject.ext.androidxAppCompatVersion}"
    implementation "androidx.coordinatorlayout:coordinatorlayout:\${rootProject.ext.androidxCoordinatorLayoutVersion}"
    implementation "androidx.core:core-splashscreen:\${rootProject.ext.coreSplashScreenVersion}"
    
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
    
    // Тестирование
    testImplementation "junit:junit:\${rootProject.ext.junitVersion}"
    androidTestImplementation "androidx.test.ext:junit:\${rootProject.ext.androidxJunitVersion}"
    androidTestImplementation "androidx.test.espresso:espresso-core:\${rootProject.ext.androidxEspressoCoreVersion}"
    
    // ❌ УДАЛИТЕ эти дублирующиеся строки:
    // implementation("com.facebook.react:react-android")  ← НЕ НУЖНО для Capacitor!
    // implementation "androidx.appcompat:appcompat:..."   ← ДУБЛИКАТ!
    // implementation "androidx.swiperefreshlayout:..."    ← НЕ ИСПОЛЬЗУЕТСЯ
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied")
}`;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'error', label: 'Ошибка', icon: '❌' },
    { id: 'cause', label: 'Причина', icon: '🔍' },
    { id: 'fix', label: 'Решение', icon: '✅' },
    { id: 'files', label: 'Файлы', icon: '📄' },
  ];

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <TopAppBar title="🔧 Исправление сборки" showBack={true} showLogout={true} />

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === tab.id ? tabActive : tabInactive
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Tab */}
        {activeTab === 'error' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">❌</span> Текущая ошибка
              </h3>

              <div className="border-l-4 border-red-500 pl-3">
                <p className="text-xs font-bold text-red-500 uppercase mb-1">Ошибка (строка 36)</p>
                <p className="text-sm font-mono break-all">
                  Could not get unknown property 'androidxCoordinatorLayoutVersion' for object of type org.gradle.api.internal.artifacts.dsl.dependencies.DefaultDependencyHandler
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  📍 app/build.gradle, строка 36
                </p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-2">📊 История ошибок</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="line-through text-gray-500">compileSdkVersion не определён</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="line-through text-gray-500">androidxAppCompatVersion не определён</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="line-through text-gray-500">implementation в buildscript.dependencies</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span className="text-red-600 font-bold">androidxCoordinatorLayoutVersion не определён</span>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-2">🔍 Обнаруженные проблемы</h3>
              <div className="space-y-2 text-xs">
                <div className="border-l-4 border-yellow-500 pl-3">
                  <p className="font-bold text-yellow-700">1. Отсутствие переменных</p>
                  <p className="text-gray-600">Не определены: androidxCoordinatorLayoutVersion, coreSplashScreenVersion, junitVersion и др.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <p className="font-bold text-orange-700">2. Неправильный синтаксис переменных</p>
                  <p className="text-gray-600">Используется <code>$varName</code> вместо <code>${'{'}rootProject.ext.varName{'}'}</code></p>
                </div>
                <div className="border-l-4 border-purple-500 pl-3">
                  <p className="font-bold text-purple-700">3. Дублирование зависимостей</p>
                  <p className="text-gray-600">appcompat указан дважды (строки 35 и 45)</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <p className="font-bold text-blue-700">4. Лишние React Native зависимости</p>
                  <p className="text-gray-600">Это Capacitor проект, не React Native!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cause Tab */}
        {activeTab === 'cause' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🔍</span> Причина ошибки
              </h3>
              <p className="text-sm leading-relaxed mb-3">
                Переменная <code className="bg-red-100 text-red-800 px-1 rounded text-xs">androidxCoordinatorLayoutVersion</code> не определена нигде в проекте.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-bold">💡 Это Capacitor проект!</span> В Capacitor обычно используется файл <code>android/variables.gradle</code> для определения всех версий зависимостей.
                </p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">📋 Все отсутствующие переменные</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <div>
                    <code className="bg-red-100 px-1 rounded">androidxCoordinatorLayoutVersion</code>
                    <span className="text-gray-500 ml-2">(строка 36)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <div>
                    <code className="bg-red-100 px-1 rounded">coreSplashScreenVersion</code>
                    <span className="text-gray-500 ml-2">(строка 37)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <div>
                    <code className="bg-red-100 px-1 rounded">junitVersion</code>
                    <span className="text-gray-500 ml-2">(строка 40)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <div>
                    <code className="bg-red-100 px-1 rounded">androidxJunitVersion</code>
                    <span className="text-gray-500 ml-2">(строка 41)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <div>
                    <code className="bg-red-100 px-1 rounded">androidxEspressoCoreVersion</code>
                    <span className="text-gray-500 ml-2">(строка 42)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">⚠️ Проблемы синтаксиса</h3>
              <p className="text-xs text-gray-600 mb-2">В вашем файле используется неправильный синтаксис для переменных:</p>
              <div className="space-y-2">
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs font-bold text-red-700 mb-1">❌ Неправильно (строка 35):</p>
                  <code className="text-xs text-red-800 break-all">"$androidxAppCompatVersion"</code>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-xs font-bold text-green-700 mb-1">✓ Правильно:</p>
                  <code className="text-xs text-green-800 break-all">"${'{'}rootProject.ext.androidxAppCompatVersion{'}'}"</code>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">🔄 Дублирование и лишние зависимости</h3>
              <div className="space-y-3 text-xs">
                <div className="border-l-4 border-orange-500 pl-3">
                  <p className="font-bold text-orange-700">Дублирование appcompat:</p>
                  <div className="mt-1 space-y-1">
                    <p className="text-gray-600">Строка 35: <code className="bg-gray-100 px-1 rounded">implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"</code></p>
                    <p className="text-gray-600">Строка 45: <code className="bg-gray-100 px-1 rounded">implementation "androidx.appcompat:appcompat:${'{'}rootProject.ext.androidxAppCompatVersion{'}'}"</code></p>
                  </div>
                  <p className="text-gray-500 mt-1">→ Удалите одну из строк</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-3">
                  <p className="font-bold text-purple-700">Лишние React Native зависимости:</p>
                  <p className="text-gray-600 mt-1">Строка 44: <code className="bg-gray-100 px-1 rounded">implementation("com.facebook.react:react-android")</code></p>
                  <p className="text-gray-500 mt-1">→ Это Capacitor проект, удалите эту строку!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fix Tab */}
        {activeTab === 'fix' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">✅</span> Полное решение
              </h3>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold mb-2 text-green-700">Шаг 1: Создайте файл android/variables.gradle</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Создайте новый файл <code>android/variables.gradle</code> со всеми необходимыми переменными:
                  </p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard(variablesGradle, 'variables')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'variables' ? '✓' : '📋'}
                    </button>
                    <pre className="whitespace-pre-wrap">{variablesGradle}</pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold mb-2 text-green-700">Шаг 2: Добавьте apply в android/build.gradle</p>
                  <p className="text-xs text-gray-500 mb-2">
                    В начало файла <code>android/build.gradle</code> добавьте:
                  </p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard('apply from: "variables.gradle"', 'apply-vars')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'apply-vars' ? '✓' : '📋'}
                    </button>
                    <pre className="whitespace-pre-wrap">{buildGradleWithApply}</pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold mb-2 text-green-700">Шаг 3: Замените android/app/build.gradle</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Замените содержимое файла на исправленную версию:
                  </p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard(appBuildGradleFixed, 'app-fixed')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'app-fixed' ? '✓' : '📋'}
                    </button>
                    <pre className="whitespace-pre-wrap">{appBuildGradleFixed}</pre>
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 pl-3">
                  <p className="text-sm font-bold mb-2 text-blue-700">Шаг 4: Пересоберите</p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard('cd android && gradlew.bat clean && gradlew.bat assembleDebug', 'cmd')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'cmd' ? '✓' : '📋'}
                    </button>
                    <pre>cd android
gradlew.bat clean
gradlew.bat assembleDebug</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">📝 Что было исправлено</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Создан файл <code>variables.gradle</code> со всеми версиями</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Все переменные используют правильный синтаксис: <code>${'{'}rootProject.ext.varName{'}'}</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Удалено дублирование зависимости appcompat</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Удалены лишние React Native зависимости (это Capacitor проект)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Удалён закомментированный блок flatDir</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>📄</span> android/variables.gradle
                <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded">НОВЫЙ ФАЙЛ</span>
                <button
                  onClick={() => copyToClipboard(variablesGradle, 'full-variables')}
                  className="bg-red-700 text-white rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'full-variables' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </h3>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto`}>
                <pre className="whitespace-pre-wrap">{variablesGradle}</pre>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>📄</span> android/build.gradle
                <span className="ml-auto text-xs bg-blue-500 text-white px-2 py-0.5 rounded">ИЗМЕНИТЬ</span>
                <button
                  onClick={() => copyToClipboard(buildGradleWithApply, 'full-build')}
                  className="bg-red-700 text-white rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'full-build' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </h3>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto`}>
                <pre className="whitespace-pre-wrap">{buildGradleWithApply}</pre>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>📄</span> android/app/build.gradle
                <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded">ИСПРАВЛЕНО</span>
                <button
                  onClick={() => copyToClipboard(appBuildGradleFixed, 'full-app')}
                  className="bg-red-700 text-white rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'full-app' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </h3>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto`}>
                <pre className="whitespace-pre-wrap">{appBuildGradleFixed}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <h3 className="font-bold mb-3">⚡ Быстрые действия</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                copyToClipboard('cd android && gradlew.bat clean', 'clean');
              }}
              className={`py-3 rounded-xl text-sm font-bold ${
                copiedBlock === 'clean' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {copiedBlock === 'clean' ? '✓ Скопировано' : '🧹 Clean'}
            </button>
            <button
              onClick={() => {
                copyToClipboard('cd android && gradlew.bat assembleDebug', 'build');
              }}
              className={`py-3 rounded-xl text-sm font-bold ${
                copiedBlock === 'build' ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
              }`}
            >
              {copiedBlock === 'build' ? '✓ Скопировано' : '🔨 Build'}
            </button>
            <button
              onClick={() => {
                copyToClipboard('cd android && gradlew.bat assembleDebug --stacktrace', 'stack');
              }}
              className={`py-3 rounded-xl text-sm font-bold ${
                copiedBlock === 'stack' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
              }`}
            >
              {copiedBlock === 'stack' ? '✓ Скопировано' : '📊 Stacktrace'}
            </button>
            <button
              onClick={() => {
                copyToClipboard('cd android && gradlew.bat assembleDebug --info', 'info');
              }}
              className={`py-3 rounded-xl text-sm font-bold ${
                copiedBlock === 'info' ? 'bg-green-500 text-white' : 'bg-teal-500 text-white'
              }`}
            >
              {copiedBlock === 'info' ? '✓ Скопировано' : 'ℹ️ Info Log'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pb-4">
          <p>Школа Конфуция | 孔子学院 | Build Troubleshooter</p>
          <p className="mt-1">Gradle 8.14.3 • Capacitor Android</p>
        </div>
      </div>
    </div>
  );
}
