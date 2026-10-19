import React from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { ArrowLeft, LogOut, Globe, Moon, Sun } from 'lucide-react';

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  showLogout?: boolean;
}

export function TopAppBar({ title, showBack = false, showLogout = true }: TopAppBarProps) {
  const { lang, setLang, darkMode, toggleDarkMode, goBack, logout, canGoBack } = useApp();

  return (
    <div className={`sticky top-0 z-50 flex items-center justify-between px-4 py-3 shadow-md ${
      darkMode ? 'bg-[#1A1410] text-[#F5E6D3]' : 'bg-[#D32F2F] text-white'
    }`}>
      <div className="flex items-center gap-2">
        {showBack && canGoBack && (
          <button
            onClick={goBack}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label={t('back', lang)}
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="text-lg font-bold truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'ru' ? 'zh' : 'ru')}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1 text-sm font-medium"
          aria-label="Toggle language"
        >
          <Globe size={16} />
          <span>{lang === 'ru' ? '中文' : 'RU'}</span>
        </button>

        {/* Logout */}
        {showLogout && (
          <button
            onClick={logout}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label={t('logout', lang)}
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
