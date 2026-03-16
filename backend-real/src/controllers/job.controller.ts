import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import {
  createJob,
  listUserJobs,
  getJobById,
  updateJob,
  deleteJob,
} from '../services/job.service.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
} from '../utils/response.js';

// Criar job
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const job = await createJob(user.id, req.body);
    createdResponse(res, job);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message, 400);
      return;
    }
    errorResponse(res, 'Erro ao criar vaga', 500);
  }
}

// Listar jobs
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const jobs = await listUserJobs(user.id);
    successResponse(res, jobs);
  } catch (error) {
    errorResponse(res, 'Erro ao listar vagas', 500);
  }
}

// Buscar job por ID
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const { id } = req.params;
    const job = await getJobById(id, user.id);
    successResponse(res, job);
  } catch (error) {
    if (error instanceof Error && error.message === 'Vaga não encontrada') {
      notFoundResponse(res, 'Vaga');
      return;
    }
    errorResponse(res, 'Erro ao buscar vaga', 500);
  }
}

// Atualizar job
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const { id } = req.params;
    const job = await updateJob(id, user.id, req.body);
    successResponse(res, job);
  } catch (error) {
    if (error instanceof Error && error.message === 'Vaga não encontrada') {
      notFoundResponse(res, 'Vaga');
      return;
    }
    errorResponse(res, 'Erro ao atualizar vaga', 500);
  }
}

// Deletar job
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const { id } = req.params;
    await deleteJob(id, user.id);
    successResponse(res, { message: 'Vaga deletada com sucesso' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Vaga não encontrada') {
      notFoundResponse(res, 'Vaga');
      return;
    }
    errorResponse(res, 'Erro ao deletar vaga', 500);
  }
}