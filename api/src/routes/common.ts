import { FastifyInstance } from 'fastify';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';
import type { Contest, Event, Notification, PointsAccount, PointsTransaction } from '../types';

export default async function commonRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // ========== GET /contests ==========
  fastify.get('/contests', async (request, reply) => {
    try {
      const contests = await sql<Contest[]>`
        SELECT * FROM contests
        WHERE status = 'open'
        ORDER BY start_date ASC
      `;

      return {
        success: true,
        data: contests,
      };
    } catch (error) {
      console.error('Get contests error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /events ==========
  fastify.get('/events', async (request, reply) => {
    try {
      const events = await sql<Event[]>`
        SELECT * FROM events
        WHERE status = 'open'
        ORDER BY start_at ASC
      `;

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      console.error('Get events error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /notifications ==========
  fastify.get('/notifications', async (request, reply) => {
    try {
      const userId = request.user.id;

      const notifications = await sql<Notification[]>`
        SELECT * FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 50
      `;

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== POST /notifications/:id/read ==========
  fastify.post<{ Params: { id: string } }>('/notifications/:id/read', async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.id;

      await sql`
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ${id} AND user_id = ${userId}
      `;

      return {
        success: true,
        message: 'Notification marked as read',
      };
    } catch (error) {
      console.error('Mark notification read error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /points ==========
  fastify.get('/points', async (request, reply) => {
    try {
      const userId = request.user.id;

      const accounts = await sql<PointsAccount[]>`
        SELECT * FROM points_accounts
        WHERE user_id = ${userId}
      `;

      if (accounts.length === 0) {
        return {
          success: true,
          data: {
            user_id: userId,
            balance: 0,
            total_earned: 0,
          },
        };
      }

      return {
        success: true,
        data: accounts[0],
      };
    } catch (error) {
      console.error('Get points error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // ========== GET /points/transactions ==========
  fastify.get('/points/transactions', async (request, reply) => {
    try {
      const userId = request.user.id;

      const transactions = await sql<PointsTransaction[]>`
        SELECT * FROM points_transactions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 50
      `;

      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      console.error('Get points transactions error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
}
