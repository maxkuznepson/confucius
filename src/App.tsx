import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentPage } from './pages/StudentPage';
import { ParentPage } from './pages/ParentPage';
import { TeacherPage } from './pages/TeacherPage';
import { DebugPage } from './pages/DebugPage';
import { BuildFixPage } from './pages/BuildFixPage';

function Router() {
  const { currentPath } = useApp();

  // Parse route
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/register') {
    return <RegisterPage />;
  }

  if (currentPath.startsWith('/child/')) {
    const studentId = currentPath.split('/child/')[1];
    return <StudentPage studentId={studentId} />;
  }

  if (currentPath.startsWith('/parent/')) {
    const parentId = currentPath.split('/parent/')[1];
    return <ParentPage parentId={parentId} />;
  }

  if (currentPath.startsWith('/teacher/')) {
    const teacherId = currentPath.split('/teacher/')[1];
    return <TeacherPage teacherId={teacherId} />;
  }

  if (currentPath === '/debug') {
    return <DebugPage />;
  }

  if (currentPath === '/build-fix') {
    return <BuildFixPage />;
  }

  return <LoginPage />;
}

function App() {
  return (
    <AppProvider>
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl">
        <Router />
      </div>
    </AppProvider>
  );
}

export default App;
