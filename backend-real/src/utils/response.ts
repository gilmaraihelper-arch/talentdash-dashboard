import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

// Resposta de sucesso
export function successResponse<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse<T>['meta']
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };
  res.status(statusCode).json(response);
}

// Resposta de erro
export function errorResponse(
  res: Response,
  message: string,
  statusCode: number = 400
): void {
  const response: ApiResponse = {
    success: false,
    error: message,
  };
  res.status(statusCode).json(response);
}

// Resposta de criação bem-sucedida
export function createdResponse<T>(res: Response, data: T): void {
  successResponse(res, data, 201);
}

// Resposta de não encontrado
export function notFoundResponse(res: Response, resource: string = 'Resource'): void {
  errorResponse(res, `${resource} not found`, 404);
}

// Resposta de não autorizado
export function unauthorizedResponse(res: Response, message: string = 'Unauthorized'): void {
  errorResponse(res, message, 401);
}

// Resposta de proibido
export function forbiddenResponse(res: Response, message: string = 'Forbidden'): void {
  errorResponse(res, message, 403);
}

// Resposta de erro do servidor
export function serverErrorResponse(res: Response, message: string = 'Internal server error'): void {
  errorResponse(res, message, 500);
}