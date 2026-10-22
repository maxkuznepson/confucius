import { FastifyInstance } from 'fastify';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';
import type { Student, Grade, Attendance } from '../types';

export default async function parentRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // ========== GET /parents/me ==========
  fastify.get('/me', async (request, reply) => {
    try {
      const userId = request.user.id;

      const parents = await sql`
        SELECT p.*, u.full_name, u.email, u.phone
        FROM parents p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ${userId}
      `;

      if (parents.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Parent profile not found',
        });
      }

      return {
        success: true,
        data: parents[0],
      };
    } catch (error) {
      console.error('Get parent me error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /parents/me/children ==========
  fastify.get('/me/children', async (request, reply) => {
    try {
      const userId = request.user.id;

      const children = await sql<(Student & { full_name: string; email: string; phone: string })[]>`
        SELECT s.*, u.full_name, u.email, u.phone
        FROM students s
        JOIN parent_students ps ON ps.student_id = s.id
        JOIN parents p ON p.id = ps.parent_id
        JOIN users u ON u.id = s.user_id
        WHERE p.user_id = ${userId}
        ORDER BY s.student_no
      `;

      return {
        success: true,
        data: children,
      };
    } catch (error) {
      console.error('Get parent children error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /parents/children/:studentId/grades ==========
  fastify.get<{ Params: { studentId: string } }>('/children/:studentId/grades', async (request, reply) => {
    try {
      const { studentId } = request.params;
      const userId = request.user.id;

      // Проверяем, что этот ученик действительно ребёнок текущего родителя
      const link = await sql`
        SELECT 1 FROM parent_students ps
        JOIN parents p ON p.id = ps.parent_id
        WHERE p.user_id = ${userId} AND ps.student_id = ${studentId}
      `;

      if (link.length === 0) {
        return reply.status(403).send({
          success: false,
          error: 'Access denied',
        });
      }

      const grades = await sql<Grade[]>`
        SELECT * FROM grades
        WHERE student_id = ${studentId}
        ORDER BY graded_at DESC
      `;

      return {
        success: true,
        data: grades,
      };
    } catch (error) {
      console.error('Get child grades error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /parents/children/:studentId/attendance ==========
  fastify.get<{ Params: { studentId: string } }>('/children/:studentId/attendance', async (request, reply) => {
    try {
      const { studentId } = request.params;
      const userId = request.user.id;

      const link = await sql`
        SELECT 1 FROM parent_students ps
        JOIN parents p ON p.id = ps.parent_id
        WHERE p.user_id = ${userId} AND ps.student_id = ${studentId}
      `;

      if (link.length === 0) {
        return reply.status(403).send({
          success: false,
          error: 'Access denied',
        });
      }

      const attendance = await sql<Attendance[]>`
        SELECT * FROM attendance
        WHERE student_id = ${studentId}
        ORDER BY marked_at DESC
      `;

      return {
        success: true,
        data: attendance,
      };
    } catch (error) {
      console.error('Get child attendance error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
}
