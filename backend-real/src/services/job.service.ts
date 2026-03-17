import { prisma } from '../prisma.js';
import { CreateJobInput, SafeUser } from '../types/index.js';
import { Job, Candidate } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler.js';

// Criar novo job
export async function createJob(
  userId: string,
  input: CreateJobInput
): Promise<Job> {
  return prisma.job.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      template: input.template || 'default',
      colorTheme: input.colorTheme || 'blue',
      customFields: input.customFields as any || {},
    },
  });
}

// Listar jobs do usuário
export async function listUserJobs(userId: string): Promise<Job[]> {
  return prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// Buscar job por ID
export async function getJobById(
  jobId: string,
  userId: string
): Promise<Job & { candidates: Candidate[] }> {
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId,
    },
    include: {
      candidates: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!job) {
    throw new ApiError('Vaga não encontrada', 404);
  }

  return job;
}

// Atualizar job
export async function updateJob(
  jobId: string,
  userId: string,
  input: Partial<CreateJobInput>
): Promise<Job> {
  // Verificar se o job existe e pertence ao usuário
  const existingJob = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId,
    },
  });

  if (!existingJob) {
    throw new ApiError('Vaga não encontrada', 404);
  }

  return prisma.job.update({
    where: { id: jobId },
    data: {
      name: input.name,
      description: input.description,
      template: input.template,
      colorTheme: input.colorTheme,
      customFields: input.customFields as any,
    },
  });
}

// Deletar job
export async function deleteJob(
  jobId: string,
  userId: string
): Promise<void> {
  // Verificar se o job existe e pertence ao usuário
  const existingJob = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId,
    },
  });

  if (!existingJob) {
    throw new ApiError('Vaga não encontrada', 404);
  }

  await prisma.job.delete({
    where: { id: jobId },
  });
}