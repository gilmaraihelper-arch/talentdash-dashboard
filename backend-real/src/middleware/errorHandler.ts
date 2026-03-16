import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { errorResponse, serverErrorResponse } from '../utils/response.js';

// Classe de erro da API
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Middleware de tratamento de erros
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  // Erros da API
  if (err instanceof ApiError) {
    errorResponse(res, err.message, err.statusCode);
    return;
  }

  // Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Violation de unique constraint
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.[0] || 'campo';
      errorResponse(res, `Já existe um registro com este ${field}`, 409);
      return;
    }

    // Record not found
    if (err.code === 'P2025') {
      errorResponse(res, 'Registro não encontrado', 404);
      return;
    }

    // Foreign key constraint failed
    if (err.code === 'P2003') {
      errorResponse(res, 'Referência inválida', 400);
      return;
    }

    errorResponse(res, 'Erro no banco de dados', 500);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    errorResponse(res, 'Dados inválidos', 400);
    return;
  }

  // Erro genérico
  serverErrorResponse(res);
}