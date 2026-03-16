import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import {
  registerUser,
  loginUser,
  getUserById,
} from '../services/auth.service.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
} from '../utils/response.js';

// Registro de usuário
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await registerUser(req.body);
    createdResponse(res, result);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message, 409);
      return;
    }
    errorResponse(res, 'Erro ao registrar usuário', 500);
  }
}

// Login de usuário
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await loginUser(req.body);
    successResponse(res, result);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message, 401);
      return;
    }
    errorResponse(res, 'Erro ao fazer login', 500);
  }
}

// Perfil do usuário
export async function me(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }
    successResponse(res, user);
  } catch (error) {
    errorResponse(res, 'Erro ao buscar perfil', 500);
  }
}

// Atualizar perfil (placeholder)
export async function updateProfile(req: Request, res: Response): Promise<void> {
  // Implementar quando necessário
  errorResponse(res, 'Funcionalidade em desenvolvimento', 501);
}