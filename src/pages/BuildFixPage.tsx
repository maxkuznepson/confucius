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

  const rootBuildGradleCorrect = `// android/build.gradle — ПРАВИЛЬНАЯ ВЕРСИЯ

buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.9.22"
        
        // Переменные для зависимостей (используются в app/build.gradle)
        androidxAppCompatVersion = "1.6.1"
        androidxSwiperefreshlayoutVersion = "1.1.0"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        // ⚠️ В buildscript.dependencies ТОЛЬКО classpath!
        classpath("com.android.tools.build:gradle:8.1.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:\${project.ext.kotlinVersion}")
        
        // ❌ НЕ ДОЛЖНО БЫТЬ ЗДЕСЬ:
        // implementation "androidx.appcompat:appcompat:..."  ← ОШИБКА!
    }
}

allprojects {
    repositories {
        maven {
            url("\${rootDir}/../node_modules/react-native/android")
        }
        maven {
            url("\${rootDir}/../node_modules/jsc-android/dist")
        }
        mavenCentral {
            content {
                excludeGroup "com.facebook.react"
            }
        }
        google()
        maven { url 'https://www.jitpack.io' }
    }
}`;

  const appBuildGradleCorrect = `// android/app/build.gradle — ПРАВИЛЬНАЯ ВЕРСИЯ

apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "com.confucius"
    defaultConfig {
        applicationId "com.confucius"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
    
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
        }
    }
}

dependencies {
    // ✅ ЗДЕСЬ можно использовать implementation!
    implementation("com.facebook.react:react-android")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:\${rootProject.ext.kotlinVersion}")
    
    // ✅ AndroidX зависимости (двойные кавычки для интерполяции!)
    implementation "androidx.appcompat:appcompat:\${rootProject.ext.androidxAppCompatVersion}"
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:\${rootProject.ext.androidxSwiperefreshlayoutVersion}"
}`;

  const settingsGradle = `// android/settings.gradle

rootProject.name = 'confucius'

apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle");
applyNativeModulesSettingsGradle(settings)

include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
        google()
    }
}`;

  const gradleProperties = `# android/gradle.properties

org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true

reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
newArchEnabled=false
hermesEnabled=true
reactNative.useNewArch=false`;

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

              <div className="space-y-3">
                <div className="border-l-4 border-red-500 pl-3">
                  <p className="text-xs font-bold text-red-500 uppercase mb-1">Ошибка (строка 36)</p>
                  <p className="text-sm font-mono break-all">
                    Could not find method implementation() for arguments [androidx.appcompat:appcompat:$&#123;rootProject.ext.androidxAppCompatVersion&#125;] on object of type org.gradle.api.internal.artifacts.dsl.dependencies.DefaultDependencyHandler.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 android/build.gradle, строка 36
                  </p>
                </div>
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
                  <span className="text-red-500 font-bold">✗</span>
                  <span className="text-red-600 font-bold">implementation() в buildscript.dependencies</span>
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
                Метод <code className="bg-red-100 text-red-800 px-1 rounded text-xs font-bold">implementation</code> используется <span className="font-bold text-red-600">в неправильном месте</span>.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-800">
                  <span className="font-bold">❌ НЕПРАВИЛЬНО:</span> Вы добавили <code>implementation</code> зависимости в блок <code>buildscript.dependencies</code> файла <code>android/build.gradle</code>
                </p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">📚 Как работает Gradle</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-3">
                  <p className="text-sm font-bold text-blue-700">buildscript.dependencies</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Используется <span className="font-bold">ТОЛЬКО</span> для Gradle плагинов. Здесь доступен метод:
                  </p>
                  <div className={`${codeBg} rounded-lg p-2 mt-2 text-xs font-mono`}>
                    <pre>classpath("com.android.tools.build:gradle:8.1.1")</pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold text-green-700">app/build.gradle → dependencies</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Используется для библиотек приложения. Здесь доступны методы:
                  </p>
                  <div className={`${codeBg} rounded-lg p-2 mt-2 text-xs font-mono`}>
                    <pre>{`implementation "androidx.appcompat:appcompat:1.6.1"
implementation "com.facebook.react:react-android"`}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">🎯 Что произошло</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <div>
                    <p className="font-bold">Предыдущая ошибка:</p>
                    <p className="text-xs text-gray-600">androidxAppCompatVersion не определён</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <div>
                    <p className="font-bold">Вы добавили переменную в ext ✓</p>
                    <p className="text-xs text-gray-600">Но также скопировали зависимости в buildscript</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <div>
                    <p className="font-bold text-red-600">Результат:</p>
                    <p className="text-xs text-gray-600">implementation() не существует в buildscript.dependencies</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">⚠️ Вторая проблема: Кавычки</h3>
              <p className="text-xs text-gray-600 mb-2">
                В ошибке видно: <code className="bg-gray-100 px-1 rounded">appcompat:$&#123;rootProject.ext.androidxAppCompatVersion&#125;</code>
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Переменная <span className="font-bold">не интерполируется</span>, потому что строка в одинарных кавычках.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="font-bold text-red-700 mb-1">❌ Неправильно:</p>
                  <code className="text-red-800 break-all">'...:$&#123;rootProject.ext.var&#125;'</code>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="font-bold text-green-700 mb-1">✓ Правильно:</p>
                  <code className="text-green-800 break-all">"...:$&#123;rootProject.ext.var&#125;"</code>
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
                <span className="text-2xl">✅</span> Решение
              </h3>

              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-3">
                  <p className="text-sm font-bold mb-2 text-red-700">Шаг 1: УДАЛИТЕ implementation из android/build.gradle</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Откройте <code>android/build.gradle</code>, найдите строку 36 и удалите все строки с <code>implementation</code> из блока <code>buildscript.dependencies</code>.
                  </p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard(`// ❌ УДАЛИТЕ ЭТИ СТРОКИ из buildscript.dependencies:
implementation "androidx.appcompat:appcompat:..."
implementation "androidx.swiperefreshlayout:..."

// ✅ ОСТАВЬТЕ ТОЛЬКО classpath:
dependencies {
    classpath("com.android.tools.build:gradle:8.1.1")
    classpath("com.facebook.react:react-native-gradle-plugin")
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:\${project.ext.kotlinVersion}")
}`, 'remove-impl')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'remove-impl' ? '✓' : '📋'}
                    </button>
                    <pre className="whitespace-pre-wrap">{`// ❌ УДАЛИТЕ ЭТИ СТРОКИ из buildscript.dependencies:
implementation "androidx.appcompat:appcompat:..."
implementation "androidx.swiperefreshlayout:..."

// ✅ ОСТАВЬТЕ ТОЛЬКО classpath:
dependencies {
    classpath("com.android.tools.build:gradle:8.1.1")
    classpath("com.facebook.react:react-native-gradle-plugin")
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:\${project.ext.kotlinVersion}")
}`}</pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold mb-2 text-green-700">Шаг 2: Добавьте dependencies в android/app/build.gradle</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Переместите <code>implementation</code> зависимости в <code>android/app/build.gradle</code>. Используйте <span className="font-bold text-green-600">двойные кавычки</span> для интерполяции переменных!
                  </p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard(`dependencies {
    implementation("com.facebook.react:react-android")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:\${rootProject.ext.kotlinVersion}")
    
    // ✅ Двойные кавычки для интерполяции!
    implementation "androidx.appcompat:appcompat:\${rootProject.ext.androidxAppCompatVersion}"
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:\${rootProject.ext.androidxSwiperefreshlayoutVersion}"
}`, 'add-deps')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'add-deps' ? '✓' : '📋'}
                    </button>
                    <pre className="whitespace-pre-wrap">{`dependencies {
    implementation("com.facebook.react:react-android")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:\${rootProject.ext.kotlinVersion}")
    
    // ✅ Двойные кавычки для интерполяции!
    implementation "androidx.appcompat:appcompat:\${rootProject.ext.androidxAppCompatVersion}"
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:\${rootProject.ext.androidxSwiperefreshlayoutVersion}"
}`}</pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold mb-2 text-green-700">Шаг 3: Убедитесь что ext содержит переменные</p>
                  <p className="text-xs text-gray-500 mb-2">
                    В <code>android/build.gradle</code> блок <code>ext</code> должен содержать:
                  </p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard(`ext {
    buildToolsVersion = "34.0.0"
    minSdkVersion = 21
    compileSdkVersion = 34
    targetSdkVersion = 34
    ndkVersion = "25.1.8937393"
    kotlinVersion = "1.9.22"
    androidxAppCompatVersion = "1.6.1"
    androidxSwiperefreshlayoutVersion = "1.1.0"
}`, 'ext-block')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'ext-block' ? '✓' : '📋'}
                    </button>
                    <pre className="whitespace-pre-wrap">{`ext {
    buildToolsVersion = "34.0.0"
    minSdkVersion = 21
    compileSdkVersion = 34
    targetSdkVersion = 34
    ndkVersion = "25.1.8937393"
    kotlinVersion = "1.9.22"
    androidxAppCompatVersion = "1.6.1"
    androidxSwiperefreshlayoutVersion = "1.1.0"
}`}</pre>
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
              <h3 className="font-bold mb-3">💡 Запомните правило</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-bold text-yellow-800 mb-2">📌 Где какие зависимости:</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded shrink-0">build.gradle</span>
                    <span>→ <code className="bg-blue-100 px-1 rounded">classpath()</code> (только плагины Gradle)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded shrink-0">app/build.gradle</span>
                    <span>→ <code className="bg-green-100 px-1 rounded">implementation</code> (библиотеки приложения)</span>
                  </div>
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
                <span>📄</span> android/build.gradle
                <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded">ПРАВИЛЬНО</span>
                <button
                  onClick={() => copyToClipboard(rootBuildGradleCorrect, 'full-root')}
                  className="bg-red-700 text-white rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'full-root' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </h3>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto`}>
                <pre className="whitespace-pre-wrap">{rootBuildGradleCorrect}</pre>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>📄</span> android/app/build.gradle
                <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded">ПРАВИЛЬНО</span>
                <button
                  onClick={() => copyToClipboard(appBuildGradleCorrect, 'full-app')}
                  className="bg-red-700 text-white rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'full-app' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </h3>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto`}>
                <pre className="whitespace-pre-wrap">{appBuildGradleCorrect}</pre>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>📄</span> android/settings.gradle
                <button
                  onClick={() => copyToClipboard(settingsGradle, 'full-settings')}
                  className="ml-auto bg-red-700 text-white rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'full-settings' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </h3>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto`}>
                <pre className="whitespace-pre-wrap">{settingsGradle}</pre>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>📄</span> android/gradle.properties
                <button
                  onClick={() => copyToClipboard(gradleProperties, 'full-props')}
                  className="ml-auto bg-red-700 text-white rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'full-props' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </h3>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto`}>
                <pre className="whitespace-pre-wrap">{gradleProperties}</pre>
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
          <p className="mt-1">Gradle 8.14.3 • React Native Android</p>
        </div>
      </div>
    </div>
  );
}
