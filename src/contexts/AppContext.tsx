import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Lang } from '../i18n/translations';
import { User, authenticateUser, getStudentByUserId, getParentByUserId, getTeacherByUserId, Student, Parent, Teacher } from '../data/mock';

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
  login: (username: string, password: string) => boolean;
  logout: () => void;
  navigateTo: (path: string) => void;
  currentPath: string;
  history: string[];
  goBack: () => void;
  canGoBack: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ru');
  const [darkMode, setDarkMode] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ user: null, student: null, parent: null, teacher: null });
  const [currentPath, setCurrentPath] = useState('/login');
  const [history, setHistory] = useState<string[]>(['/login']);

  const toggleDarkMode = useCallback(() => setDarkMode(d => !d), []);

  const login = useCallback((username: string, password: string): boolean => {
    const user = authenticateUser(username, password);
    if (!user) return false;

    const student = user.role === 'student' ? getStudentByUserId(user.id) || null : null;
    const parent = user.role === 'parent' ? getParentByUserId(user.id) || null : null;
    const teacher = user.role === 'teacher' ? getTeacherByUserId(user.id) || null : null;

    setAuth({ user, student, parent, teacher });

    let nextPath = '/login';
    if (user.role === 'student' && student) nextPath = `/child/${student.id}`;
    else if (user.role === 'parent' && parent) nextPath = `/parent/${parent.id}`;
    else if (user.role === 'teacher' && teacher) nextPath = `/teacher/${teacher.id}`;

    setCurrentPath(nextPath);
    setHistory([nextPath]);
    return true;
  }, []);

  const logout = useCallback(() => {
    setAuth({ user: null, student: null, parent: null, teacher: null });
    setCurrentPath('/login');
    setHistory(['/login']);
  }, []);

  const navigateTo = useCallback((path: string) => {
    setCurrentPath(path);
    setHistory(h => [...h, path]);
  }, []);

  const goBack = useCallback(() => {
    setHistory(h => {
      if (h.length <= 1) return h;
      const newHistory = h.slice(0, -1);
      setCurrentPath(newHistory[newHistory.length - 1]);
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
