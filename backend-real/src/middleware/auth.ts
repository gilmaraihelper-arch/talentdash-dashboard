import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, SafeUser } from '../types/index.js';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../prisma.js';
import { unauthorizedResponse, serverErrorResponse } from '../utils/response.js';

// Middleware de autenticação
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      unauthorizedResponse(res, 'Token não fornecido');
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      unauthorizedResponse(res, 'Usuário não encontrado');
      return;
    }

    // Adicionar usuário ao request
    (req as AuthenticatedRequest).user = user as SafeUser;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      unauthorizedResponse(res, 'Token inválido');
      return;
    }
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      unauthorizedResponse(res, 'Token expirado');
      return;
    }
    serverErrorResponse(res);
  }
}

// Middleware opcional de autenticação (não bloqueia)
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user) {
      (req as AuthenticatedRequest).user = user as SafeUser;
    }

    next();
  } catch {
    // Em caso de erro, continua sem autenticação
    next();
  }
}