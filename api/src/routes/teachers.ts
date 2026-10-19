import { FastifyInstance } from 'fastify';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';
import type { Student } from '../types';

export default async function teacherRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // ========== GET /teachers/me ==========
  fastify.get('/me', async (request, reply) => {
    try {
      const userId = request.user.id;

      const teachers = await sql`
        SELECT t.*, u.full_name, u.email, u.phone
        FROM teachers t
        JOIN users u ON u.id = t.user_id
        WHERE t.user_id = ${userId}
      `;

      if (teachers.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Teacher profile not found',
        });
      }

      return {
        success: true,
        data: teachers[0],
      };
    } catch (error) {
      console.error('Get teacher me error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /teachers/me/students ==========
  fastify.get('/me/students', async (request, reply) => {
    try {
      const userId = request.user.id;

      const students = await sql<(Student & { full_name: string; email: string; phone: string })[]>`
        SELECT s.*, u.full_name, u.email, u.phone
        FROM students s
        JOIN teacher_students ts ON ts.student_id = s.id
        JOIN teachers t ON t.id = ts.teacher_id
        JOIN users u ON u.id = s.user_id
        WHERE t.user_id = ${userId}
        ORDER BY s.student_no
      `;

      return {
        success: true,
        data: students,
      };
    } catch (error) {
      console.error('Get teacher students error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
}
