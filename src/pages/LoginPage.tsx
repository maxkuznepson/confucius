import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { Globe, Moon, Sun } from 'lucide-react';
import { formatPhoneInput, getDefaultPhone } from '../utils/phone';

export function LoginPage() {
  const { lang, setLang, darkMode, toggleDarkMode, login, navigateTo } = useApp();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState(getDefaultPhone());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { apiStatus, apiError } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const success = await login(identifier, password);
      if (!success) {
        setError(lang === 'ru' ? 'Неверный логин или пароль' : '用户名或密码错误');
      }
    } catch (error) {
      setError(lang === 'ru' ? 'Ошибка входа' : '登录错误');
    }
  };

  const bgClass = darkMode ? 'bg-[#1A1410]' : 'bg-[#FFF3C4]';
  const textClass = darkMode ? 'text-[#F5E6D3]' : 'text-[#212121]';
  const cardClass = darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]';
  const inputBg = darkMode ? 'bg-[#2A2018] border-[#4A3A1A] text-[#E8D9A0]' : 'bg-white border-gray-300 text-gray-900';
  const labelClass = darkMode ? 'text-[#E8D9A0]' : 'text-gray-700';

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
      {/* Top bar with language/theme toggles */}
      <div className="flex justify-end items-center gap-2 p-3">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? 'bg-[#4A3A1A] text-[#E8D9A0]' : 'bg-white/50 text-gray-700'}`}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => setLang(lang === 'ru' ? 'zh' : 'ru')}
          className={`p-2 rounded-full flex items-center gap-1 text-sm font-medium ${darkMode ? 'bg-[#4A3A1A] text-[#E8D9A0]' : 'bg-white/50 text-gray-700'}`}
        >
          <Globe size={16} />
          <span>{lang === 'ru' ? '中文' : 'RU'}</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${cardClass} flex items-center justify-center shadow-lg`}>
            <span className="text-3xl">🏯</span>
          </div>
          <h1 className="text-2xl font-bold">{t('login', lang)}</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-[#E8D9A0]' : 'text-gray-600'}`}>
            {lang === 'ru' ? 'Школа Конфуция' : '孔子学院'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          {/* Method selector */}
          <div className={`rounded-xl p-4 ${darkMode ? 'bg-[#2A2018]' : 'bg-white'} shadow-sm`}>
            <label className={`text-sm font-medium ${labelClass} mb-2 block`}>
              {t('loginMethod', lang)}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'phone'}
                  onChange={() => {
                    setMethod('phone');
                    setIdentifier(getDefaultPhone());
                  }}
                  className="accent-red-600"
                />
                <span className="text-sm">{t('phone', lang)}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'email'}
                  onChange={() => {
                    setMethod('email');
                    setIdentifier('');
                  }}
                  className="accent-red-600"
                />
                <span className="text-sm">{t('email', lang)}</span>
              </label>
            </div>
          </div>

          {/* Identifier field */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {method === 'phone' ? t('phone', lang) : t('email', lang)}
            </label>
            <input
              type={method === 'phone' ? 'tel' : 'email'}
              value={identifier}
              onChange={(e) => {
                if (method === 'phone') {
                  const newValue = e.target.value;
                  // Если пользователь пытается удалить +7, игнорируем
                  const digits = newValue.replace(/\D/g, '');
                  if (digits.length < 1 || !digits.startsWith('7')) {
                    setIdentifier(getDefaultPhone());
                  } else {
                    setIdentifier(formatPhoneInput(identifier, newValue));
                  }
                } else {
                  setIdentifier(e.target.value);
                }
              }}
              placeholder={method === 'phone' ? t('phonePlaceholder', lang) : t('emailPlaceholder', lang)}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Password field */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('password', lang)}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Login button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl ${cardClass} text-white font-bold text-lg shadow-md hover:opacity-90 transition-opacity`}
          >
            {t('loginBtn', lang)}
          </button>

          {/* Register link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigateTo('/register')}
              className={`text-sm underline ${darkMode ? 'text-[#E8D9A0]' : 'text-red-700'}`}
            >
              {t('registerLink', lang)}
            </button>
          </div>

          {/* API Status indicator */}
          <div className={`mt-4 p-3 rounded-xl text-xs ${
            apiStatus === 'mock' 
              ? (darkMode ? 'bg-[#2A2018] text-yellow-400' : 'bg-yellow-100 text-yellow-800')
              : apiStatus === 'connected'
              ? (darkMode ? 'bg-[#2A2018] text-green-400' : 'bg-green-100 text-green-800')
              : apiStatus === 'error'
              ? (darkMode ? 'bg-[#2A2018] text-red-400' : 'bg-red-100 text-red-800')
              : (darkMode ? 'bg-[#2A2018] text-gray-400' : 'bg-gray-100 text-gray-600')
          }`}>
            <p className="font-medium mb-1">
              {apiStatus === 'checking' && (lang === 'ru' ? '⏳ Проверка подключения...' : '⏳ 检查连接...')}
              {apiStatus === 'mock' && (lang === 'ru' ? '🔧 Режим: MOCK (локальные данные)' : '🔧 模式：MOCK（本地数据）')}
              {apiStatus === 'connected' && (lang === 'ru' ? '✅ Режим: API (сервер подключён)' : '✅ 模式：API（服务器已连接）')}
              {apiStatus === 'error' && (lang === 'ru' ? '❌ Режим: API (ошибка подключения)' : '❌ 模式：API（连接错误）')}
            </p>
            {apiStatus === 'error' && apiError && (
              <p className="text-xs opacity-70 mt-1">{apiError}</p>
            )}
          </div>

          {/* Test credentials hint */}
          <div className={`mt-4 p-3 rounded-xl text-xs ${darkMode ? 'bg-[#2A2018] text-[#E8D9A0]' : 'bg-white/70 text-gray-600'}`}>
            <p className="font-medium mb-1">{lang === 'ru' ? 'Тестовые данные (пароль: 123):' : '测试账号（密码：123）：'}</p>
            <p className="font-medium mt-2 mb-1">{lang === 'ru' ? '📧 Email:' : '📧 邮箱：'}</p>
            <p>student1@confucius.ru — {lang === 'ru' ? 'Ученик' : '学生'}</p>
            <p>parent1@confucius.ru — {lang === 'ru' ? 'Родитель' : '家长'}</p>
            <p>teacher1@confucius.ru — {lang === 'ru' ? 'Учитель' : '教师'}</p>
            <p className="font-medium mt-2 mb-1">{lang === 'ru' ? '📱 Телефон:' : '📱 手机号：'}</p>
            <p>+7-999-888-0001 — {lang === 'ru' ? 'Ученик' : '学生'}</p>
            <p>+7-999-888-0003 — {lang === 'ru' ? 'Родитель' : '家长'}</p>
            <p>+7-999-888-0100 — {lang === 'ru' ? 'Учитель' : '教师'}</p>
            <p className="mt-1 opacity-60 italic">{lang === 'ru' ? 'Ввод: +7-999-888-0001' : '输入：+7-999-888-0001'}</p>
            <p className="mt-2 opacity-70">{lang === 'ru' ? 'Всего: 60 учеников, 60 родителей, 10 учителей' : '共60名学生，60名家长，10名教师'}</p>
          </div>
        </form>
      </div>
    </div>
  );
}
