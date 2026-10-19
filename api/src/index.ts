import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

import { testConnection } from './config/database';
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import parentRoutes from './routes/parents';
import teacherRoutes from './routes/teachers';
import commonRoutes from './routes/common';
import { authenticate } from './middleware/auth';

dotenv.config();

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// ========== Плагины ==========

// CORS
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
fastify.register(cors, {
  origin: corsOrigins,
  credentials: true,
});

// JWT
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});

// Декларируем middleware authenticate для использования в роутах
fastify.decorate('authenticate', authenticate);

// ========== Роуты ==========

// Health check
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
});

// API роуты
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(studentRoutes, { prefix: '/api/students' });
fastify.register(parentRoutes, { prefix: '/api/parents' });
fastify.register(teacherRoutes, { prefix: '/api/teachers' });
fastify.register(commonRoutes, { prefix: '/api' });

// ========== Запуск сервера ==========

const start = async () => {
  try {
    // Тестируем подключение к БД
    await testConnection();

    // Запускаем сервер
    const port = parseInt(process.env.PORT || '3000');
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  API сервер "Школа Конфуция" запущен                     ║
╠═══════════════════════════════════════════════════════════╣
║  URL: http://${host}:${port}
║  Режим: ${process.env.NODE_ENV || 'development'}
║  
║  Endpoints:
║  POST /api/auth/login          - Вход
║  POST /api/auth/register       - Регистрация
║  GET  /api/auth/me             - Текущий пользователь
║  
║  GET  /api/students/me         - Профиль ученика
║  GET  /api/students/me/courses - Курсы ученика
║  GET  /api/students/me/grades  - Оценки ученика
║  
║  GET  /api/parents/me          - Профиль родителя
║  GET  /api/parents/me/children - Дети родителя
║  
║  GET  /api/teachers/me         - Профиль учителя
║  GET  /api/teachers/me/students - Ученики учителя
║  
║  GET  /api/contests            - Конкурсы
║  GET  /api/events              - Мероприятия
║  GET  /api/notifications       - Уведомления
║  GET  /api/points              - Баллы
╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
