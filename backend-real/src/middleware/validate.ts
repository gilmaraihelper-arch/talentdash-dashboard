import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response.js';

// Factory de middleware de validação
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Substituir os dados validados no request
      req.body = validated.body ?? req.body;
      req.query = validated.query ?? req.query;
      req.params = validated.params ?? req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        errorResponse(res, `Erro de validação: ${messages.join(', ')}`, 400);
        return;
      }
      errorResponse(res, 'Erro de validação', 400);
    }
  };
}

// Middleware para validar apenas body
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        errorResponse(res, `Erro de validação: ${messages.join(', ')}`, 400);
        return;
      }
      errorResponse(res, 'Erro de validação', 400);
    }
  };
}

// Middleware para validar apenas query
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        errorResponse(res, `Erro de validação: ${messages.join(', ')}`, 400);
        return;
      }
      errorResponse(res, 'Erro de validação', 400);
    }
  };
}

// Middleware para validar apenas params
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        errorResponse(res, `Erro de validação: ${messages.join(', ')}`, 400);
        return;
      }
      errorResponse(res, 'Erro de validação', 400);
    }
  };
}