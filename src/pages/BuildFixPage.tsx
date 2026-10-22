import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { TopAppBar } from '../components/TopAppBar';

type Step = 'delete' | 'prepare' | 'init' | 'sync' | 'build' | 'verify';

export function BuildFixPage() {
  const { darkMode } = useApp();
  const [activeStep, setActiveStep] = useState<Step>('delete');
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  const bgClass = darkMode ? 'bg-[#1A1410] text-[#F5E6D3]' : 'bg-[#FFF3C4] text-[#212121]';
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';
  const codeBg = darkMode ? 'bg-[#1a1a2e] text-green-300' : 'bg-[#1e1e2e] text-green-300';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBlock(id);
      setTimeout(() => setCopiedBlock(null), 2000);
    });
  };

  const toggleComplete = (step: Step) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(step)) {
      newCompleted.delete(step);
    } else {
      newCompleted.add(step);
    }
    setCompletedSteps(newCompleted);
  };

  const progress = Math.round((completedSteps.size / 6) * 100);

  const steps: { id: Step; num: number; title: string; icon: string }[] = [
    { id: 'delete', num: 1, title: 'Удалить', icon: '🗑️' },
    { id: 'prepare', num: 2, title: 'Подготовка', icon: '📦' },
    { id: 'init', num: 3, title: 'Init', icon: '⚡' },
    { id: 'sync', num: 4, title: 'Sync', icon: '🔄' },
    { id: 'build', num: 5, title: 'Build', icon: '🔨' },
    { id: 'verify', num: 6, title: 'Проверка', icon: '✅' },
  ];

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <TopAppBar title="🔄 Пересоздание Android" showBack={true} showLogout={true} />

      <div className="p-4 space-y-4">
        {/* Progress Bar */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">Прогресс</h3>
            <span className="text-xs font-mono">{completedSteps.size}/6</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {progress === 100 ? '🎉 Готово! Проект пересоздан.' : `${progress}% выполнено`}
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex gap-1 rounded-xl overflow-hidden">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-colors relative ${
                activeStep === step.id
                  ? 'bg-red-700 text-white'
                  : completedSteps.has(step.id)
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : darkMode
                  ? 'bg-[#3A3028] text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <span className="block">{step.icon}</span>
              <span className="block mt-0.5">{step.num}</span>
            </button>
          ))}
        </div>

        {/* Step 1: Delete */}
        {activeStep === 'delete' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">🗑️</span> Шаг 1: Удаление
                </h3>
                <button
                  onClick={() => toggleComplete('delete')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    completedSteps.has('delete')
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {completedSteps.has('delete') ? '✓ Готово' : 'Отметить'}
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-red-800 font-bold">⚠️ ВНИМАНИЕ!</p>
                <p className="text-xs text-red-700 mt-1">
                  Перед удалением убедитесь, что у вас нет уникальных настроек в папке android (например, кастомные ресурсы, подписи, google-services.json).
                </p>
              </div>

              <p className="text-sm mb-3">Удалите папку android полностью:</p>

              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative mb-3`}>
                <button
                  onClick={() => copyToClipboard('cd C:\\Users\\mkuzn\\AndroidStudioProjects\\confucius\nrmdir /s /q android', 'del-cmd')}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'del-cmd' ? '✓' : '📋'}
                </button>
                <pre>{`cd C:\\Users\\mkuzn\\AndroidStudioProjects\\confucius
rmdir /s /q android`}</pre>
              </div>

              <p className="text-xs text-gray-500 mb-2">Или через Проводник:</p>
              <ol className="text-xs space-y-1 list-decimal list-inside text-gray-600">
                <li>Откройте папку проекта в Проводнике</li>
                <li>Найдите папку <code className="bg-gray-100 px-1 rounded">android</code></li>
                <li>Нажмите <kbd className="bg-gray-200 px-1 rounded text-xs">Delete</kbd></li>
                <li>Подтвердите удаление</li>
              </ol>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  💡 <span className="font-bold">Сохраните</span> файл <code>google-services.json</code> (если есть) — он понадобится позже!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Prepare */}
        {activeStep === 'prepare' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">📦</span> Шаг 2: Подготовка
                </h3>
                <button
                  onClick={() => toggleComplete('prepare')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    completedSteps.has('prepare')
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {completedSteps.has('prepare') ? '✓ Готово' : 'Отметить'}
                </button>
              </div>

              <p className="text-sm mb-3">Убедитесь, что веб-приложение собирается:</p>

              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative mb-3`}>
                <button
                  onClick={() => copyToClipboard('npm run build', 'npm-build')}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'npm-build' ? '✓' : '📋'}
                </button>
                <pre>npm run build</pre>
              </div>

              <p className="text-sm mb-3">Проверьте capacitor.config.ts:</p>

              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative mb-3`}>
                <button
                  onClick={() => copyToClipboard(`import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.confucius.school',
  appName: 'Школа Конфуция',
  webDir: 'dist',
  server: {
    // androidCleartextTraffic: true, // для HTTP (разработка)
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;`, 'cap-config')}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'cap-config' ? '✓' : '📋'}
                </button>
                <pre className="whitespace-pre-wrap">{`import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.confucius.school',
  appName: 'Школа Конфуция',
  webDir: 'dist',
  server: {
    // androidCleartextTraffic: true, // для HTTP (разработка)
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;`}</pre>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 <span className="font-bold">webDir</span> должен указывать на папку с собранным веб-приложением (обычно <code>dist</code> для Vite).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Init */}
        {activeStep === 'init' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">⚡</span> Шаг 3: Инициализация
                </h3>
                <button
                  onClick={() => toggleComplete('init')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    completedSteps.has('init')
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {completedSteps.has('init') ? '✓ Готово' : 'Отметить'}
                </button>
              </div>

              <p className="text-sm mb-3">Добавьте Android платформу:</p>

              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative mb-3`}>
                <button
                  onClick={() => copyToClipboard('npx cap add android', 'cap-add')}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'cap-add' ? '✓' : '📋'}
                </button>
                <pre>npx cap add android</pre>
              </div>

              <p className="text-xs text-gray-500 mb-2">Эта команда:</p>
              <ul className="text-xs space-y-1 list-disc list-inside text-gray-600">
                <li>Создаст папку <code className="bg-gray-100 px-1 rounded">android/</code></li>
                <li>Настроит Gradle автоматически</li>
                <li>Создаст правильные файлы build.gradle</li>
                <li>Определит все необходимые переменные</li>
              </ul>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  ✅ <span className="font-bold">Capacitor автоматически создаст все файлы</span> с правильными версиями зависимостей. Не нужно ничего редактировать вручную!
                </p>
              </div>

              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⏳ Команда может выполняться 1-3 минуты. Дождитесь завершения.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Sync */}
        {activeStep === 'sync' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">🔄</span> Шаг 4: Синхронизация
                </h3>
                <button
                  onClick={() => toggleComplete('sync')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    completedSteps.has('sync')
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {completedSteps.has('sync') ? '✓ Готово' : 'Отметить'}
                </button>
              </div>

              <p className="text-sm mb-3">Синхронизируйте веб-приложение с Android:</p>

              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative mb-3`}>
                <button
                  onClick={() => copyToClipboard('npx cap sync android', 'cap-sync')}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'cap-sync' ? '✓' : '📋'}
                </button>
                <pre>npx cap sync android</pre>
              </div>

              <p className="text-xs text-gray-500 mb-2">Эта команда:</p>
              <ul className="text-xs space-y-1 list-disc list-inside text-gray-600">
                <li>Скопирует файлы из <code className="bg-gray-100 px-1 rounded">dist/</code> в Android проект</li>
                <li>Обновит нативные зависимости</li>
                <li>Синхронизирует плагины</li>
              </ul>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 <span className="font-bold">Запускайте sync</span> после каждого изменения веб-кода, чтобы обновления попадали в Android.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Build */}
        {activeStep === 'build' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">🔨</span> Шаг 5: Сборка APK
                </h3>
                <button
                  onClick={() => toggleComplete('build')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    completedSteps.has('build')
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {completedSteps.has('build') ? '✓ Готово' : 'Отметить'}
                </button>
              </div>

              <p className="text-sm mb-3">Соберите debug APK:</p>

              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative mb-3`}>
                <button
                  onClick={() => copyToClipboard('cd android\ngradlew.bat assembleDebug', 'gradle-build')}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'gradle-build' ? '✓' : '📋'}
                </button>
                <pre>{`cd android
gradlew.bat assembleDebug`}</pre>
              </div>

              <p className="text-xs text-gray-500 mb-2">Или одной командой:</p>

              <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative mb-3`}>
                <button
                  onClick={() => copyToClipboard('cd android && gradlew.bat clean assembleDebug', 'gradle-one')}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                >
                  {copiedBlock === 'gradle-one' ? '✓' : '📋'}
                </button>
                <pre>cd android && gradlew.bat clean assembleDebug</pre>
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  ✅ <span className="font-bold">APK будет создан:</span> <code>android/app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>

              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 <span className="font-bold">Альтернатива:</span> Откройте папку <code>android</code> в Android Studio и нажмите <kbd className="bg-blue-100 px-1 rounded">▶ Run</kbd>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Verify */}
        {activeStep === 'verify' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">✅</span> Шаг 6: Проверка
                </h3>
                <button
                  onClick={() => toggleComplete('verify')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    completedSteps.has('verify')
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {completedSteps.has('verify') ? '✓ Готово' : 'Отметить'}
                </button>
              </div>

              <p className="text-sm mb-3">Проверьте, что всё работает:</p>

              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold text-green-700">1. APK создан</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Проверьте наличие файла: <code className="bg-gray-100 px-1 rounded">android/app/build/outputs/apk/debug/app-debug.apk</code>
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold text-green-700">2. Установите на устройство</p>
                  <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative mt-2`}>
                    <button
                      onClick={() => copyToClipboard('adb install android/app/build/outputs/apk/debug/app-debug.apk', 'adb-install')}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
                    >
                      {copiedBlock === 'adb-install' ? '✓' : '📋'}
                    </button>
                    <pre>adb install android/app/build/outputs/apk/debug/app-debug.apk</pre>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-bold text-green-700">3. Запустите приложение</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Найдите "Школа Конфуция" в списке приложений и запустите
                  </p>
                </div>
              </div>

              {progress === 100 && (
                <div className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="font-bold">Поздравляем!</p>
                  <p className="text-xs mt-1 opacity-90">Android проект успешно пересоздан с нуля</p>
                </div>
              )}
            </div>

            <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
              <h3 className="font-bold mb-3">📋 Чек-лист</h3>
              <div className="space-y-2 text-sm">
                {[
                  'Папка android удалена',
                  'npm run build выполнен',
                  'npx cap add android выполнен',
                  'npx cap sync android выполнен',
                  'APK успешно собран',
                  'Приложение запускается',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className={idx < completedSteps.size ? '' : 'text-gray-400'}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Commands */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <h3 className="font-bold mb-3">⚡ Все команды одной строкой</h3>
          <div className={`${codeBg} rounded-lg p-3 text-xs font-mono overflow-x-auto relative`}>
            <button
              onClick={() => copyToClipboard(
                `rmdir /s /q android
npm run build
npx cap add android
npx cap sync android
cd android && gradlew.bat clean assembleDebug`,
                'all-cmds'
              )}
              className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs"
            >
              {copiedBlock === 'all-cmds' ? '✓ Скопировано' : '📋 Копировать всё'}
            </button>
            <pre className="whitespace-pre-wrap">{`rmdir /s /q android
npm run build
npx cap add android
npx cap sync android
cd android && gradlew.bat clean assembleDebug`}</pre>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ⚠️ Выполняйте команды последовательно, дождавшись завершения каждой
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pb-4">
          <p>Школа Конфуция | 孔子学院 | Android Reset Guide</p>
          <p className="mt-1">Capacitor • Gradle • React</p>
        </div>
      </div>
    </div>
  );
}
