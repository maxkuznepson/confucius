import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Lang } from '../i18n/translations';
import { User, Student, Parent, Teacher } from '../data/mock';
import { api } from '../services';
import { USE_MOCK, API_CONFIG } from '../config';

interface AuthState {
  user: User | null;
  student: Student | null;
  parent: Parent | null;
  teacher: Teacher | null;
}

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  auth: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  navigateTo: (path: string) => void;
  currentPath: string;
  history: string[];
  goBack: () => void;
  canGoBack: boolean;
  apiStatus: 'checking' | 'connected' | 'mock' | 'error';
  apiError: string | null;
}

const AppContext = createContext<AppContextType | null>(null);

// Ключи для localStorage
const STORAGE_KEYS = {
  lang: 'confucius_lang',
  darkMode: 'confucius_dark_mode',
  auth: 'confucius_auth',
  currentPath: 'confucius_current_path',
  history: 'confucius_history',
};

// Восстановление состояния из localStorage
function loadState<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      console.log(`[Storage] Загружено: ${key}`, JSON.parse(stored));
      return JSON.parse(stored);
    }
    console.log(`[Storage] Не найдено: ${key}, используется значение по умолчанию`);
  } catch (e) {
    console.warn(`[Storage] Ошибка загрузки ${key}:`, e);
  }
  return defaultValue;
}

// Сохранение состояния в localStorage
function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`[Storage] Сохранено: ${key}`, value);
  } catch (e) {
    console.warn(`[Storage] Ошибка сохранения ${key}:`, e);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Загрузка состояния из localStorage
  const [lang, setLangState] = useState<Lang>(() => loadState(STORAGE_KEYS.lang, 'ru'));
  const [darkMode, setDarkModeState] = useState(() => loadState(STORAGE_KEYS.darkMode, false));
  const [auth, setAuth] = useState<AuthState>(() => loadState(STORAGE_KEYS.auth, {
    user: null, student: null, parent: null, teacher: null
  }));
  const [currentPath, setCurrentPathState] = useState(() => loadState(STORAGE_KEYS.currentPath, '/login'));
  const [history, setHistory] = useState<string[]>(() => loadState(STORAGE_KEYS.history, ['/login']));
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'mock' | 'error'>('checking');
  const [apiError, setApiError] = useState<string | null>(null);

  // Проверка подключения к API при старте
  useEffect(() => {
    async function checkApi() {
      if (USE_MOCK) {
        setApiStatus('mock');
        console.log('[App] Режим: MOCK (локальные данные)');
        return;
      }

      try {
        const response = await fetch(`${API_CONFIG.baseUrl.replace('/api', '')}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        
        if (response.ok) {
          setApiStatus('connected');
          console.log('[App] Режим: API (сервер подключён)');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        setApiStatus('error');
        setApiError(error instanceof Error ? error.message : 'Не удалось подключиться к API');
        console.error('[App] Ошибка подключения к API:', error);
      }
    }
    
    checkApi();
  }, []);

  // Обёртки с сохранением в localStorage
  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    saveState(STORAGE_KEYS.lang, newLang);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkModeState(prev => {
      const newValue = !prev;
      saveState(STORAGE_KEYS.darkMode, newValue);
      return newValue;
    });
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    console.log('[Login] Попытка входа:', username);
    try {
      const response = await api.login(username, password);
      if (!response) {
        console.log('[Login] Неверные учетные данные');
        return false;
      }

      const { user, role, profile } = response;
      console.log('[Login] Успешный вход:', { userId: user.id, role });
      
      const student = role === 'student' ? (profile as Student) : null;
      const parent = role === 'parent' ? (profile as Parent) : null;
      const teacher = role === 'teacher' ? (profile as Teacher) : null;

      const newAuth = { user, student, parent, teacher };
      setAuth(newAuth);
      saveState(STORAGE_KEYS.auth, newAuth);

      let nextPath = '/login';
      if (role === 'student' && student) nextPath = `/child/${student.id}`;
      else if (role === 'parent' && parent) nextPath = `/parent/${parent.id}`;
      else if (role === 'teacher' && teacher) nextPath = `/teacher/${teacher.id}`;

      console.log('[Login] Переход на:', nextPath);
      setCurrentPathState(nextPath);
      setHistory([nextPath]);
      saveState(STORAGE_KEYS.currentPath, nextPath);
      saveState(STORAGE_KEYS.history, [nextPath]);
      
      return true;
    } catch (error) {
      console.error('[Login Error]', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('[Logout] Выход из системы');
    try {
      await api.logout();
    } catch (error) {
      console.error('[Logout Error]', error);
    }
    
    const emptyAuth = { user: null, student: null, parent: null, teacher: null };
    setAuth(emptyAuth);
    setCurrentPathState('/login');
    setHistory(['/login']);
    
    saveState(STORAGE_KEYS.auth, emptyAuth);
    saveState(STORAGE_KEYS.currentPath, '/login');
    saveState(STORAGE_KEYS.history, ['/login']);
    console.log('[Logout] Состояние очищено');
  }, []);

  const navigateTo = useCallback((path: string) => {
    console.log('[Navigate] Переход на:', path);
    setCurrentPathState(path);
    setHistory(h => {
      const newHistory = [...h, path];
      saveState(STORAGE_KEYS.currentPath, path);
      saveState(STORAGE_KEYS.history, newHistory);
      return newHistory;
    });
  }, []);

  const goBack = useCallback(() => {
    setHistory(h => {
      if (h.length <= 1) return h;
      const newHistory = h.slice(0, -1);
      const newPath = newHistory[newHistory.length - 1];
      setCurrentPathState(newPath);
      saveState(STORAGE_KEYS.currentPath, newPath);
      saveState(STORAGE_KEYS.history, newHistory);
      return newHistory;
    });
  }, []);

  const canGoBack = history.length > 1 && currentPath !== '/login';

  return (
    <AppContext.Provider value={{
      lang, setLang,
      darkMode, toggleDarkMode,
      auth, login, logout,
      navigateTo, currentPath, history,
      goBack, canGoBack,
      apiStatus, apiError,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
