import { FastifyInstance } from 'fastify';
import sql from '../config/database';
import { authenticate, requireRole } from '../middleware/auth';
import type { Course, CourseLesson, Homework, HomeworkSubmission, Grade, LessonRating, Attendance, Achievement } from '../types';

export default async function studentRoutes(fastify: FastifyInstance) {
  // Все роуты требуют аутентификации
  fastify.addHook('preHandler', authenticate);

  // ========== GET /students/me ==========
  fastify.get('/me', async (request, reply) => {
    try {
      const userId = request.user.id;

      const students = await sql`
        SELECT s.*, u.full_name, u.email, u.phone
        FROM students s
        JOIN users u ON u.id = s.user_id
        WHERE s.user_id = ${userId}
      `;

      if (students.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Student profile not found',
        });
      }

      return {
        success: true,
        data: students[0],
      };
    } catch (error) {
      console.error('Get student me error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /students/me/courses ==========
  fastify.get('/me/courses', async (request, reply) => {
    try {
      const userId = request.user.id;

      const courses = await sql<Course[]>`
        SELECT c.*
        FROM courses c
        JOIN course_enrollments ce ON ce.course_id = c.id
        JOIN students s ON s.id = ce.student_id
        WHERE s.user_id = ${userId}
          AND c.status = 'published'
        ORDER BY c.is_additional, c.title
      `;

      return {
        success: true,
        data: courses,
      };
    } catch (error) {
      console.error('Get student courses error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /students/me/lessons ==========
  fastify.get('/me/lessons', async (request, reply) => {
    try {
      const userId = request.user.id;

      const lessons = await sql<CourseLesson[]>`
        SELECT DISTINCT cl.*
        FROM course_lessons cl
        JOIN courses c ON c.id = cl.course_id
        JOIN course_enrollments ce ON ce.course_id = c.id
        JOIN students s ON s.id = ce.student_id
        WHERE s.user_id = ${userId}
        ORDER BY cl.scheduled_at DESC
        LIMIT 50
      `;

      return {
        success: true,
        data: lessons,
      };
    } catch (error) {
      console.error('Get student lessons error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /students/me/homeworks ==========
  fastify.get('/me/homeworks', async (request, reply) => {
    try {
      const userId = request.user.id;

      const homeworks = await sql<Homework[]>`
        SELECT DISTINCT h.*
        FROM homeworks h
        JOIN courses c ON c.id = h.course_id
        JOIN course_enrollments ce ON ce.course_id = c.id
        JOIN students s ON s.id = ce.student_id
        WHERE s.user_id = ${userId}
        ORDER BY h.deadline_at DESC
      `;

      return {
        success: true,
        data: homeworks,
      };
    } catch (error) {
      console.error('Get student homeworks error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /students/me/submissions ==========
  fastify.get('/me/submissions', async (request, reply) => {
    try {
      const userId = request.user.id;

      const submissions = await sql<HomeworkSubmission[]>`
        SELECT hs.*
        FROM homework_submissions hs
        JOIN students s ON s.id = hs.student_id
        WHERE s.user_id = ${userId}
        ORDER BY hs.submitted_at DESC NULLS LAST
      `;

      return {
        success: true,
        data: submissions,
      };
    } catch (error) {
      console.error('Get student submissions error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /students/me/grades ==========
  fastify.get('/me/grades', async (request, reply) => {
    try {
      const userId = request.user.id;

      const grades = await sql<Grade[]>`
        SELECT g.*
        FROM grades g
        JOIN students s ON s.id = g.student_id
        WHERE s.user_id = ${userId}
        ORDER BY g.graded_at DESC
      `;

      return {
        success: true,
        data: grades,
      };
    } catch (error) {
      console.error('Get student grades error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /students/me/ratings ==========
  fastify.get('/me/ratings', async (request, reply) => {
    try {
      const userId = request.user.id;

      const ratings = await sql<LessonRating[]>`
        SELECT lr.*
        FROM lesson_ratings lr
        JOIN students s ON s.id = lr.student_id
        WHERE s.user_id = ${userId}
        ORDER BY lr.rated_at DESC
      `;

      return {
        success: true,
        data: ratings,
      };
    } catch (error) {
      console.error('Get student ratings error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /students/me/attendance ==========
  fastify.get('/me/attendance', async (request, reply) => {
    try {
      const userId = request.user.id;

      const attendance = await sql<Attendance[]>`
        SELECT a.*
        FROM attendance a
        JOIN students s ON s.id = a.student_id
        WHERE s.user_id = ${userId}
        ORDER BY a.marked_at DESC
      `;

      return {
        success: true,
        data: attendance,
      };
    } catch (error) {
      console.error('Get student attendance error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /students/me/achievements ==========
  fastify.get('/me/achievements', async (request, reply) => {
    try {
      const userId = request.user.id;

      const achievements = await sql<Achievement[]>`
        SELECT a.*
        FROM achievements a
        JOIN students s ON s.id = a.student_id
        WHERE s.user_id = ${userId}
        ORDER BY a.issued_date DESC
      `;

      return {
        success: true,
        data: achievements,
      };
    } catch (error) {
      console.error('Get student achievements error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
}
