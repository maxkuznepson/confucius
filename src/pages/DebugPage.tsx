import React from 'react';
import { useApp } from '../contexts/AppContext';
import { TopAppBar } from '../components/TopAppBar';

export function DebugPage() {
  const { lang, darkMode, auth, currentPath, history, apiStatus } = useApp();

  const storageData = {
    lang: localStorage.getItem('confucius_lang'),
    darkMode: localStorage.getItem('confucius_dark_mode'),
    auth: localStorage.getItem('confucius_auth'),
    currentPath: localStorage.getItem('confucius_current_path'),
    history: localStorage.getItem('confucius_history'),
    authToken: localStorage.getItem('confucius_auth_token'),
  };

  const clearAll = () => {
    if (confirm('Очистить все данные localStorage?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const bgClass = darkMode ? 'bg-[#1A1410] text-[#F5E6D3]' : 'bg-[#FFF3C4] text-[#212121]';
  const cardBg = darkMode ? 'bg-[#2A2018]' : 'bg-white';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <TopAppBar title="🔧 Debug" showBack={true} showLogout={true} />
      
      <div className="p-4 space-y-4">
        {/* API Status */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <h3 className="font-bold mb-2">API Status</h3>
          <p className="text-sm">
            Статус: <span className={`font-mono ${
              apiStatus === 'connected' ? 'text-green-500' :
              apiStatus === 'mock' ? 'text-yellow-500' :
              apiStatus === 'error' ? 'text-red-500' : 'text-gray-500'
            }`}>{apiStatus}</span>
          </p>
        </div>

        {/* Current State */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <h3 className="font-bold mb-2">Текущее состояние</h3>
          <div className="space-y-1 text-sm">
            <p>Язык: <span className="font-mono">{lang}</span></p>
            <p>Тёмная тема: <span className="font-mono">{darkMode ? 'да' : 'нет'}</span></p>
            <p>Текущий путь: <span className="font-mono">{currentPath}</span></p>
            <p>История: <span className="font-mono">{history.length} экранов</span></p>
            <p>Авторизован: <span className="font-mono">{auth.user ? auth.user.username : 'нет'}</span></p>
            {auth.user && (
              <>
                <p className="ml-4">ID: <span className="font-mono text-xs">{auth.user.id}</span></p>
                <p className="ml-4">Роль: <span className="font-mono">{auth.user.role}</span></p>
              </>
            )}
          </div>
        </div>

        {/* localStorage Data */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <h3 className="font-bold mb-2">localStorage</h3>
          <div className="space-y-2 text-xs">
            {Object.entries(storageData).map(([key, value]) => (
              <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <p className="font-mono font-bold">{key}:</p>
                <p className="font-mono text-gray-600 dark:text-gray-400 break-all">
                  {value || <span className="text-red-500">(пусто)</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold"
          >
            🔄 Перезагрузить страницу
          </button>
          <button
            onClick={clearAll}
            className="w-full py-3 rounded-xl bg-red-500 text-white font-bold"
          >
            🗑️ Очистить localStorage
          </button>
        </div>

        {/* Instructions */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm text-sm`}>
          <h3 className="font-bold mb-2">📋 Инструкция</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Войдите в систему</li>
            <li>Проверьте, что в localStorage появились данные</li>
            <li>Перезагрузите страницу (F5)</li>
            <li>Проверьте, что состояние восстановилось</li>
            <li>Если не работает — очистите localStorage и попробуйте снова</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
