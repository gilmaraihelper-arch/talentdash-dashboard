import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import {
  createPaymentMethod,
  listUserPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from '../services/payment.service.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
} from '../utils/response.js';

// Helper to ensure string type from params
function getParam(param: string | string[] | undefined): string {
  return Array.isArray(param) ? param[0] : param || '';
}

// Criar método de pagamento
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const paymentMethod = await createPaymentMethod(user.id, req.body);
    createdResponse(res, paymentMethod);
  } catch (error) {
    errorResponse(res, 'Erro ao criar método de pagamento', 500);
  }
}

// Listar métodos de pagamento
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const paymentMethods = await listUserPaymentMethods(user.id);
    successResponse(res, paymentMethods);
  } catch (error) {
    errorResponse(res, 'Erro ao listar métodos de pagamento', 500);
  }
}

// Buscar método de pagamento por ID
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const id = getParam(req.params.id);
    const paymentMethod = await getPaymentMethodById(id, user.id);
    successResponse(res, paymentMethod);
  } catch (error) {
    if (error instanceof Error && error.message === 'Método de pagamento não encontrado') {
      notFoundResponse(res, 'Método de pagamento');
      return;
    }
    errorResponse(res, 'Erro ao buscar método de pagamento', 500);
  }
}

// Atualizar método de pagamento
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const id = getParam(req.params.id);
    const paymentMethod = await updatePaymentMethod(id, user.id, req.body);
    successResponse(res, paymentMethod);
  } catch (error) {
    if (error instanceof Error && error.message === 'Método de pagamento não encontrado') {
      notFoundResponse(res, 'Método de pagamento');
      return;
    }
    errorResponse(res, 'Erro ao atualizar método de pagamento', 500);
  }
}

// Deletar método de pagamento
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const id = getParam(req.params.id);
    await deletePaymentMethod(id, user.id);
    successResponse(res, { message: 'Método de pagamento deletado com sucesso' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Método de pagamento não encontrado') {
      notFoundResponse(res, 'Método de pagamento');
      return;
    }
    errorResponse(res, 'Erro ao deletar método de pagamento', 500);
  }
}

// Definir método padrão
export async function setDefault(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const id = getParam(req.params.id);
    const paymentMethod = await setDefaultPaymentMethod(id, user.id);
    successResponse(res, paymentMethod);
  } catch (error) {
    if (error instanceof Error && error.message === 'Método de pagamento não encontrado') {
      notFoundResponse(res, 'Método de pagamento');
      return;
    }
    errorResponse(res, 'Erro ao definir método padrão', 500);
  }
}
