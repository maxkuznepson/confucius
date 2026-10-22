import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { TopAppBar } from '../components/TopAppBar';
import { formatPhoneInput, getDefaultPhone } from '../utils/phone';

export function RegisterPage() {
  const { lang, darkMode, navigateTo, goBack } = useApp();
  const [form, setForm] = useState({
    phone: getDefaultPhone(),
    email: '@confucius.ru',
    lastName: '',
    firstName: '',
    middleName: '',
    referrerPhone: '',
    referrerEmail: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const bgClass = darkMode ? 'bg-[#1A1410]' : 'bg-[#FFF3C4]';
  const textClass = darkMode ? 'text-[#F5E6D3]' : 'text-[#212121]';
  const cardClass = darkMode ? 'bg-[#8B1A1A]' : 'bg-[#D32F2F]';
  const inputBg = darkMode ? 'bg-[#2A2018] border-[#4A3A1A] text-[#E8D9A0]' : 'bg-white border-gray-300 text-gray-900';
  const labelClass = darkMode ? 'text-[#E8D9A0]' : 'text-gray-700';

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.lastName || !form.firstName || !form.phone || !form.email || !form.password) {
      setError(lang === 'ru' ? 'Заполните обязательные поля' : '请填写必填项');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(lang === 'ru' ? 'Пароли не совпадают' : '密码不一致');
      return;
    }

    // Mock: just show success
    setSuccess(true);
    setTimeout(() => {
      navigateTo('/login');
    }, 2000);
  };

  if (success) {
    return (
      <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
        <TopAppBar title={t('register', lang)} showBack={false} showLogout={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-medium">
              {lang === 'ru' ? 'Регистрация успешна!' : '注册成功！'}
            </p>
            <p className="text-sm mt-2 opacity-70">
              {lang === 'ru' ? 'Перенаправление на вход...' : '正在跳转到登录...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
      <TopAppBar title={t('register', lang)} showBack={true} showLogout={false} />

      <div className="flex-1 px-4 py-6 pb-20 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
          {/* Last Name */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('lastName', lang)} *
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* First Name */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('firstName', lang)} *
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Middle Name (optional) */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('middleName', lang)}
            </label>
            <input
              type="text"
              value={form.middleName}
              onChange={(e) => handleChange('middleName', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('phone', lang)} *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const newValue = e.target.value;
                const digits = newValue.replace(/\D/g, '');
                if (digits.length < 1 || !digits.startsWith('7')) {
                  handleChange('phone', getDefaultPhone());
                } else {
                  handleChange('phone', formatPhoneInput(form.phone, newValue));
                }
              }}
              placeholder={t('phonePlaceholder', lang)}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Email */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('email', lang)} *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder={t('emailPlaceholder', lang)}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Referrer Phone (optional) */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('referrerPhone', lang)}
            </label>
            <input
              type="tel"
              value={form.referrerPhone}
              onChange={(e) => {
                const newValue = e.target.value;
                if (!newValue) {
                  handleChange('referrerPhone', '');
                } else {
                  const digits = newValue.replace(/\D/g, '');
                  if (digits.length < 1 || !digits.startsWith('7')) {
                    handleChange('referrerPhone', '+7');
                  } else {
                    handleChange('referrerPhone', formatPhoneInput(form.referrerPhone, newValue));
                  }
                }
              }}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Referrer Email (optional) */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('referrerEmail', lang)}
            </label>
            <input
              type="email"
              value={form.referrerEmail}
              onChange={(e) => handleChange('referrerEmail', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Password */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('password', lang)} *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`text-sm font-medium ${labelClass} mb-1 block`}>
              {t('confirmPassword', lang)} *
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl ${cardClass} text-white font-bold text-lg shadow-md hover:opacity-90 transition-opacity`}
          >
            {t('registerBtn', lang)}
          </button>

          {/* Back to login */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigateTo('/login')}
              className={`text-sm underline ${darkMode ? 'text-[#E8D9A0]' : 'text-red-700'}`}
            >
              {t('backToLogin', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
