import { prisma } from '../prisma.js';
import { CreateCandidateInput, CandidateFilters, PaginationParams } from '../types/index.js';
import { Candidate, CandidateStatus } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler.js';

interface CandidateListResult {
  candidates: Candidate[];
  total: number;
  page: number;
  totalPages: number;
}

// Criar novo candidato
export async function createCandidate(
  jobId: string,
  input: CreateCandidateInput
): Promise<Candidate> {
  // Verificar se o job existe
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new ApiError('Vaga não encontrada', 404);
  }

  return prisma.candidate.create({
    data: {
      jobId,
      nome: input.nome,
      idade: input.idade,
      cidade: input.cidade,
      estado: input.estado,
      email: input.email,
      telefone: input.telefone,
      linkedin: input.linkedin,
      portfolio: input.portfolio,
      experiencia: input.experiencia as any || [],
      formacao: input.formacao as any || [],
      habilidades: input.habilidades || [],
      pretensaoSalarial: input.pretensaoSalarial,
      customData: input.customData as any || {},
      status: 'NEW',
    },
  });
}

// Listar candidatos de um job
export async function listJobCandidates(
  jobId: string,
  userId: string,
  filters?: CandidateFilters,
  pagination?: PaginationParams
): Promise<CandidateListResult> {
  // Verificar se o job existe e pertence ao usuário
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId,
    },
  });

  if (!job) {
    throw new ApiError('Vaga não encontrada', 404);
  }

  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const skip = (page - 1) * limit;

  // Construir where clause
  const where: {
    jobId: string;
    status?: CandidateStatus;
    cidade?: { contains: string; mode: 'insensitive' };
    AND?: Array<{
      OR?: Array<{
        nome?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    }>;
  } = { jobId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.cidade) {
    where.cidade = { contains: filters.cidade, mode: 'insensitive' };
  }

  if (filters?.search) {
    where.AND = [
      {
        OR: [
          { nome: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      },
    ];
  }

  // Contar total
  const total = await prisma.candidate.count({ where });

  // Buscar candidatos
  const candidates = await prisma.candidate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    candidates,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Buscar candidato por ID
export async function getCandidateById(
  candidateId: string,
  userId: string
): Promise<Candidate> {
  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      job: {
        userId,
      },
    },
  });

  if (!candidate) {
    throw new ApiError('Candidato não encontrado', 404);
  }

  return candidate;
}

// Atualizar candidato
export async function updateCandidate(
  candidateId: string,
  userId: string,
  input: Partial<CreateCandidateInput>
): Promise<Candidate> {
  // Verificar se o candidato existe
  const existingCandidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      job: {
        userId,
      },
    },
  });

  if (!existingCandidate) {
    throw new ApiError('Candidato não encontrado', 404);
  }

  return prisma.candidate.update({
    where: { id: candidateId },
    data: {
      nome: input.nome,
      idade: input.idade,
      cidade: input.cidade,
      estado: input.estado,
      email: input.email,
      telefone: input.telefone,
      linkedin: input.linkedin,
      portfolio: input.portfolio,
      experiencia: input.experiencia as any,
      formacao: input.formacao as any,
      habilidades: input.habilidades,
      pretensaoSalarial: input.pretensaoSalarial,
      customData: input.customData as any,
    },
  });
}

// Atualizar status do candidato
export async function updateCandidateStatus(
  candidateId: string,
  userId: string,
  status: CandidateStatus
): Promise<Candidate> {
  // Verificar se o candidato existe
  const existingCandidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      job: {
        userId,
      },
    },
  });

  if (!existingCandidate) {
    throw new ApiError('Candidato não encontrado', 404);
  }

  return prisma.candidate.update({
    where: { id: candidateId },
    data: { status },
  });
}

// Deletar candidato
export async function deleteCandidate(
  candidateId: string,
  userId: string
): Promise<void> {
  // Verificar se o candidato existe
  const existingCandidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      job: {
        userId,
      },
    },
  });

  if (!existingCandidate) {
    throw new ApiError('Candidato não encontrado', 404);
  }

  await prisma.candidate.delete({
    where: { id: candidateId },
  });
}

// Adicionar análise IA ao candidato
export async function addCandidateAnalysis(
  candidateId: string,
  userId: string,
  analysis: {
    summary: string;
    score: number;
    details: Record<string, unknown>;
  }
): Promise<Candidate> {
  // Verificar se o candidato existe
  const existingCandidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      job: {
        userId,
      },
    },
  });

  if (!existingCandidate) {
    throw new ApiError('Candidato não encontrado', 404);
  }

  return prisma.candidate.update({
    where: { id: candidateId },
    data: {
      iaSummary: analysis.summary,
      iaScore: analysis.score,
      iaAnalysis: analysis.details as any,
      analyzedAt: new Date(),
      status: 'REVIEW',
    },
  });
}