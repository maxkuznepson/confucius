import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { Globe, Moon, Sun } from 'lucide-react';

export function LoginPage() {
  const { lang, setLang, darkMode, toggleDarkMode, login, navigateTo } = useApp();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(identifier, password);
    if (!success) {
      setError(lang === 'ru' ? 'Неверный логин или пароль' : '用户名或密码错误');
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
                  onChange={() => setMethod('phone')}
                  className="accent-red-600"
                />
                <span className="text-sm">{t('phone', lang)}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'email'}
                  onChange={() => setMethod('email')}
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
              onChange={(e) => setIdentifier(e.target.value)}
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

          {/* Test credentials hint */}
          <div className={`mt-4 p-3 rounded-xl text-xs ${darkMode ? 'bg-[#2A2018] text-[#E8D9A0]' : 'bg-white/70 text-gray-600'}`}>
            <p className="font-medium mb-1">{lang === 'ru' ? 'Тестовые данные:' : '测试账号：'}</p>
            <p>student1 / 123 — {lang === 'ru' ? 'Ученик' : '学生'}</p>
            <p>parent1 / 123 — {lang === 'ru' ? 'Родитель' : '家长'}</p>
            <p>teacher1 / 123 — {lang === 'ru' ? 'Учитель' : '教师'}</p>
          </div>
        </form>
      </div>
    </div>
  );
}
