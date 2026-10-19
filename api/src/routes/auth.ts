import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import sql from '../config/database';
import type { LoginRequest, RegisterRequest, User, Student, Parent, Teacher } from '../types';

// Валидация входных данных
const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  phone: z.string().min(10, 'Phone is required'),
  email: z.string().email('Invalid email'),
  lastName: z.string().min(1, 'Last name is required'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  referrerPhone: z.string().optional(),
  referrerEmail: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // ========== POST /auth/login ==========
  fastify.post<{ Body: LoginRequest }>('/login', async (request, reply) => {
    try {
      const { identifier, password } = loginSchema.parse(request.body);

      // Нормализуем телефон (убираем всё кроме цифр)
      const normalizedPhone = identifier.replace(/\D/g, '');

      // Ищем пользователя по username, email или телефону
      const users = await sql<User[]>`
        SELECT id, username, password_hash, full_name, email, phone, role, preferred_lang
        FROM users
        WHERE 
          username = ${identifier}
          OR email = ${identifier}
          OR REPLACE(REPLACE(REPLACE(phone, '+', ''), '-', ''), ' ', '') = ${normalizedPhone}
        LIMIT 1
      `;

      if (users.length === 0) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const user = users[0];

      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Получаем профиль в зависимости от роли
      let profile: Student | Parent | Teacher;

      if (user.role === 'student') {
        const students = await sql<Student[]>`
          SELECT * FROM students WHERE user_id = ${user.id}
        `;
        profile = students[0];
      } else if (user.role === 'parent') {
        const parents = await sql<Parent[]>`
          SELECT * FROM parents WHERE user_id = ${user.id}
        `;
        profile = parents[0];
      } else {
        const teachers = await sql<Teacher[]>`
          SELECT * FROM teachers WHERE user_id = ${user.id}
        `;
        profile = teachers[0];
      }

      // Генерируем JWT токен
      const token = fastify.jwt.sign({
        id: user.id,
        role: user.role,
        username: user.username,
      });

      // Обновляем last_login_at
      await sql`
        UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}
      `;

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            preferred_lang: user.preferred_lang,
          },
          token,
          role: user.role,
          profile,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      console.error('Login error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== POST /auth/register ==========
  fastify.post<{ Body: RegisterRequest }>('/register', async (request, reply) => {
    try {
      const data = registerSchema.parse(request.body);

      // Проверяем, существует ли уже пользователь с таким email или телефоном
      const existing = await sql`
        SELECT id FROM users 
        WHERE email = ${data.email} 
           OR REPLACE(REPLACE(REPLACE(phone, '+', ''), '-', ''), ' ', '') = ${data.phone.replace(/\D/g, '')}
      `;

      if (existing.length > 0) {
        return reply.status(409).send({
          success: false,
          error: 'User already exists',
        });
      }

      // Хэшируем пароль
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Создаём пользователя
      const fullName = `${data.lastName} ${data.firstName}${data.middleName ? ' ' + data.middleName : ''}`;
      const username = data.email.split('@')[0];

      const [user] = await sql<User[]>`
        INSERT INTO users (username, password_hash, full_name, email, phone, role, preferred_lang)
        VALUES (${username}, ${passwordHash}, ${fullName}, ${data.email}, ${data.phone}, 'student', 'ru')
        RETURNING id, username, full_name, email, phone, role, preferred_lang
      `;

      // Создаём профиль студента
      const [student] = await sql<Student[]>`
        INSERT INTO students (user_id, student_no, status)
        VALUES (${user.id}, ${'STU-' + Date.now()}, 'active')
        RETURNING *
      `;

      return reply.status(201).send({
        success: true,
        data: {
          user,
          profile: student,
        },
        message: 'Registration successful',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      console.error('Register error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /auth/me ==========
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.id;

      const users = await sql<User[]>`
        SELECT id, username, full_name, email, phone, role, preferred_lang, is_active
        FROM users WHERE id = ${userId}
      `;

      if (users.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'User not found',
        });
      }

      return {
        success: true,
        data: users[0],
      };
    } catch (error) {
      console.error('Get me error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
}
