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

  const rootBuildGradle = `// android/build.gradle

buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.9.22"
        
        // AndroidX dependencies
        androidxAppCompatVersion = "1.6.1"
        androidxSwiperefreshlayoutVersion = "1.1.0"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:gradle")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:\${project.ext.kotlinVersion}")
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

  const appBuildGradle = `// android/app/build.gradle

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
    implementation("com.facebook.react:react-android")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:\${rootProject.ext.kotlinVersion}")
    
    // AndroidX dependencies
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

# Use this property to specify which architecture you want to build.
# You can also override it from the CLI using
# ./gradlew <task> -PreactNativeArchitectures=x86_64
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# Use this property to enable support to the new architecture.
newArchEnabled=false

# Use this property to enable or disable the Hermes JS engine.
hermesEnabled=true

# Enable GIF support in React Native images
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
                <span className="text-2xl">❌</span> Ошибки сборки
              </h3>

              <div className="space-y-3">
                <div className="border-l-4 border-red-500 pl-3">
                  <p className="text-xs font-bold text-red-500 uppercase mb-1">Ошибка 1 (текущая)</p>
                  <p className="text-sm font-mono">
                    Could not get unknown property 'androidxAppCompatVersion' for object of type org.gradle.api.internal.artifacts.dsl.dependencies.DefaultDependencyHandler
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 app/build.gradle, строка 35
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-3">
                  <p className="text-xs font-bold text-yellow-600 uppercase mb-1">⚠️ Предупреждение</p>
                  <p className="text-sm">
                    Using flatDir should be avoided because it doesn't support any meta-data formats
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 app/build.gradle (репозиторий flatDir)
                  </p>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-2">📋 Предыдущие ошибки (исправлены)</h3>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>✓ compileSdkVersion не определён</li>
                <li>✓ Repository warnings от init.gradle</li>
              </ul>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-2">⏱️ Время сборки</h3>
              <p className="text-sm">BUILD FAILED in <span className="font-mono font-bold text-red-500">6s</span></p>
              <p className="text-xs text-gray-500 mt-1">Gradle 8.14.3</p>
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
              <p className="text-sm leading-relaxed">
                Свойство <code className="bg-red-100 text-red-800 px-1 rounded text-xs">androidxAppCompatVersion</code> не определено в блоке <code className="bg-blue-100 text-blue-800 px-1 rounded">ext</code> файла <code className="bg-gray-100 px-1 rounded text-xs">android/build.gradle</code>, но используется в <code className="bg-gray-100 px-1 rounded text-xs">android/app/build.gradle</code> (строка 35).
              </p>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">🔗 Цепочка зависимости</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <span><code className="text-xs bg-gray-100 px-1 rounded">android/build.gradle</code></span>
                </div>
                <div className="ml-3 text-xs text-gray-500">
                  Должен определять <code className="bg-blue-100 text-blue-800 px-1 rounded">ext {'{'} androidxAppCompatVersion = "1.6.1" {'}'}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <span><code className="text-xs bg-gray-100 px-1 rounded">android/app/build.gradle</code></span>
                </div>
                <div className="ml-3 text-xs text-gray-500">
                  Использует <code className="bg-blue-100 text-blue-800 px-1 rounded">rootProject.ext.androidxAppCompatVersion</code> в dependencies
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">⚠️ О предупреждении flatDir</h3>
              <p className="text-xs text-gray-500 mb-2">
                flatDir — это устаревший способ подключения локальных библиотек. Если у вас есть:
              </p>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono`}>
                <pre>{`repositories {
    flatDir {
        dirs 'libs'
    }
}`}</pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Это можно удалить, если вы не используете локальные .jar/.aar файлы. Или замените на maven репозиторий.
              </p>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">📦 Необходимые переменные в ext</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><code className="bg-gray-100 px-1 rounded">buildToolsVersion = "34.0.0"</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><code className="bg-gray-100 px-1 rounded">minSdkVersion = 21</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><code className="bg-gray-100 px-1 rounded">compileSdkVersion = 34</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><code className="bg-gray-100 px-1 rounded">targetSdkVersion = 34</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><code className="bg-gray-100 px-1 rounded">ndkVersion = "25.1.8937393"</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><code className="bg-gray-100 px-1 rounded">kotlinVersion = "1.9.22"</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span><code className="bg-red-100 px-1 rounded">androidxAppCompatVersion = "1.6.1"</code> <span className="text-red-500">(ОТСУТСТВУЕТ!)</span></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span><code className="bg-red-100 px-1 rounded">androidxSwiperefreshlayoutVersion = "1.1.0"</code> <span className="text-red-500">(ОТСУТСТВУЕТ!)</span></span>
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
                <span className="text-2xl">✅</span> Быстрое решение
              </h3>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold mb-2">Шаг 1: Добавьте недостающие переменные в android/build.gradle</p>
                  <p className="text-xs text-gray-500 mb-2">Откройте <code>android/build.gradle</code> и добавьте в блок <code>ext</code>:</p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard(`androidxAppCompatVersion = "1.6.1"\nandroidxSwiperefreshlayoutVersion = "1.1.0"`, 'ext-vars')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'ext-vars' ? '✓' : '📋'}
                    </button>
                    <pre>{`ext {
    buildToolsVersion = "34.0.0"
    minSdkVersion = 21
    compileSdkVersion = 34
    targetSdkVersion = 34
    ndkVersion = "25.1.8937393"
    kotlinVersion = "1.9.22"
    
    <span className="text-yellow-300 font-bold">// Добавьте эти строки:</span>
    <span className="text-green-400">androidxAppCompatVersion = "1.6.1"</span>
    <span className="text-green-400">androidxSwiperefreshlayoutVersion = "1.1.0"</span>
}`}</pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold mb-2">Шаг 2: Проверьте строку 35 в app/build.gradle</p>
                  <p className="text-xs text-gray-500 mb-2">Убедитесь, что dependencies использует правильные переменные:</p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard(`implementation "androidx.appcompat:appcompat:\${rootProject.ext.androidxAppCompatVersion}"`, 'appcompat-dep')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'appcompat-dep' ? '✓' : '📋'}
                    </button>
                    <pre>{`dependencies {
    implementation("com.facebook.react:react-android")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:\${rootProject.ext.kotlinVersion}")
    
    <span className="text-yellow-300 font-bold">// Строка 35 должна быть:</span>
    <span className="text-green-400">implementation "androidx.appcompat:appcompat:\${rootProject.ext.androidxAppCompatVersion}"</span>
}`}</pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold mb-2">Шаг 3: Удалите flatDir (опционально)</p>
                  <p className="text-xs text-gray-500 mb-2">Если в <code>app/build.gradle</code> есть блок <code>flatDir</code>, удалите его:</p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard(`// УДАЛИТЕ этот блок:
repositories {
    flatDir {
        dirs 'libs'
    }
}`, 'flatdir')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'flatdir' ? '✓' : '📋'}
                    </button>
                    <pre>{`<span className="text-red-400">// УДАЛИТЕ этот блок:</span>
repositories {
    flatDir {
        dirs 'libs'
    }
}`}</pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold mb-2">Шаг 4: Очистите кэш и пересоберите</p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                    <button
                      onClick={() => copyToClipboard('cd android && gradlew clean && gradlew assembleDebug', 'cmd')}
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
              <h3 className="font-bold mb-3">🔄 Альтернатива: Указать версии напрямую</h3>
              <p className="text-xs text-gray-500 mb-2">Если не хотите использовать переменные, укажите версии напрямую:</p>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
                <button
                  onClick={() => copyToClipboard(`dependencies {
    implementation("com.facebook.react:react-android")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.9.22")
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:1.1.0"
}`, 'direct-deps')}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'direct-deps' ? '✓' : '📋'}
                </button>
                <pre>{`dependencies {
    implementation("com.facebook.react:react-android")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.9.22")
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:1.1.0"
}`}</pre>
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
                <button
                  onClick={() => copyToClipboard(rootBuildGradle, 'full-root')}
                  className="ml-auto bg-red-700 text-white rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'full-root' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </h3>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto`}>
                <pre className="whitespace-pre-wrap">{rootBuildGradle}</pre>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>📄</span> android/app/build.gradle
                <button
                  onClick={() => copyToClipboard(appBuildGradle, 'full-app')}
                  className="ml-auto bg-red-700 text-white rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'full-app' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </h3>
              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto`}>
                <pre className="whitespace-pre-wrap">{appBuildGradle}</pre>
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
