import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import type { UserRole } from '../types';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      role: UserRole;
      username: string;
    };
  }
}

// Middleware: проверка JWT токена
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or missing token',
    });
  }
}

// Middleware: проверка роли
export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }
  };
}
