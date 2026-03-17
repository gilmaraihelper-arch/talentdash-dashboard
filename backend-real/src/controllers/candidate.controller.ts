import { Request, Response } from 'express';
import { AuthenticatedRequest, PaginationParams } from '../types/index.js';
import {
  createCandidate,
  listJobCandidates,
  getCandidateById,
  updateCandidate,
  updateCandidateStatus,
  deleteCandidate,
  addCandidateAnalysis,
} from '../services/candidate.service.js';
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

// Criar candidato (público)
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const jobId = getParam(req.params.jobId);
    const candidate = await createCandidate(jobId, req.body);
    createdResponse(res, candidate);
  } catch (error) {
    if (error instanceof Error && error.message === 'Vaga não encontrada') {
      notFoundResponse(res, 'Vaga');
      return;
    }
    errorResponse(res, 'Erro ao criar candidato', 500);
  }
}

// Listar candidatos de um job
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const jobId = getParam(req.params.jobId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await listJobCandidates(
      jobId,
      user.id,
      {
        status: req.query.status as any,
        cidade: req.query.cidade as string,
        search: req.query.search as string,
        minScore: req.query.minScore ? parseFloat(req.query.minScore as string) : undefined,
        maxScore: req.query.maxScore ? parseFloat(req.query.maxScore as string) : undefined,
      },
      { page, limit }
    );

    successResponse(res, result.candidates, 200, {
      page: result.page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Vaga não encontrada') {
      notFoundResponse(res, 'Vaga');
      return;
    }
    errorResponse(res, 'Erro ao listar candidatos', 500);
  }
}

// Buscar candidato por ID
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const id = getParam(req.params.id);
    const candidate = await getCandidateById(id, user.id);
    successResponse(res, candidate);
  } catch (error) {
    if (error instanceof Error && error.message === 'Candidato não encontrado') {
      notFoundResponse(res, 'Candidato');
      return;
    }
    errorResponse(res, 'Erro ao buscar candidato', 500);
  }
}

// Atualizar candidato
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const id = getParam(req.params.id);
    const candidate = await updateCandidate(id, user.id, req.body);
    successResponse(res, candidate);
  } catch (error) {
    if (error instanceof Error && error.message === 'Candidato não encontrado') {
      notFoundResponse(res, 'Candidato');
      return;
    }
    errorResponse(res, 'Erro ao atualizar candidato', 500);
  }
}

// Atualizar status do candidato
export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const id = getParam(req.params.id);
    const { status } = req.body;
    const candidate = await updateCandidateStatus(id, user.id, status);
    successResponse(res, candidate);
  } catch (error) {
    if (error instanceof Error && error.message === 'Candidato não encontrado') {
      notFoundResponse(res, 'Candidato');
      return;
    }
    errorResponse(res, 'Erro ao atualizar status', 500);
  }
}

// Deletar candidato
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const id = getParam(req.params.id);
    await deleteCandidate(id, user.id);
    successResponse(res, { message: 'Candidato deletado com sucesso' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Candidato não encontrado') {
      notFoundResponse(res, 'Candidato');
      return;
    }
    errorResponse(res, 'Erro ao deletar candidato', 500);
  }
}

// Adicionar análise IA (webhook/simulação)
export async function addAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      errorResponse(res, 'Não autenticado', 401);
      return;
    }

    const id = getParam(req.params.id);
    const { summary, score, details } = req.body;

    const candidate = await addCandidateAnalysis(id, user.id, {
      summary,
      score,
      details,
    });

    successResponse(res, candidate);
  } catch (error) {
    if (error instanceof Error && error.message === 'Candidato não encontrado') {
      notFoundResponse(res, 'Candidato');
      return;
    }
    errorResponse(res, 'Erro ao adicionar análise', 500);
  }
}