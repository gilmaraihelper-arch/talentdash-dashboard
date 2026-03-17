import { z } from 'zod';
import { Plan, CandidateStatus, PaymentType } from '@prisma/client';

// Schema de validação para registro de usuário
export const registerSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres' }),
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres' }),
  companyName: z.string().optional(),
});

// Schema de validação para login
export const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Senha obrigatória' }),
});

// Schema de validação para criação de job
export const createJobSchema = z.object({
  name: z.string().min(1, { message: 'Nome da vaga é obrigatório' }),
  description: z.string().optional(),
  template: z.string().default('default'),
  colorTheme: z.string().default('blue'),
  customFields: z.record(z.unknown()).optional(),
});

// Schema de validação para atualização de job
export const updateJobSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  template: z.string().optional(),
  colorTheme: z.string().optional(),
  customFields: z.record(z.unknown()).optional(),
});

// Schema de validação para criação de candidato
export const createCandidateSchema = z.object({
  nome: z.string().min(1, { message: 'Nome é obrigatório' }),
  idade: z.number().int().min(16).max(100).optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  linkedin: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  experiencia: z.array(z.object({
    empresa: z.string(),
    cargo: z.string(),
    periodo: z.string(),
    descricao: z.string().optional(),
  })).optional(),
  formacao: z.array(z.object({
    instituicao: z.string(),
    curso: z.string(),
    periodo: z.string(),
  })).optional(),
  habilidades: z.array(z.string()).optional(),
  pretensaoSalarial: z.number().positive().optional(),
  customData: z.record(z.unknown()).optional(),
});

// Schema de validação para atualização de status do candidato
export const updateCandidateStatusSchema = z.object({
  status: z.enum([
    'NEW',
    'ANALYZING',
    'REVIEW',
    'INTERVIEW',
    'APPROVED',
    'REJECTED',
  ]),
});

// Schema de validação para criação de método de pagamento
export const createPaymentMethodSchema = z.object({
  type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO']),
  last4: z.string().length(4).optional(),
  brand: z.string().optional(),
  expMonth: z.number().int().min(1).max(12).optional(),
  expYear: z.number().int().min(2024).max(2100).optional(),
  holderName: z.string().optional(),
  pixKey: z.string().optional(),
  externalId: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Schema de validação para paginação
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
});

// Schema de validação para filtros de candidatos
export const candidateFiltersSchema = z.object({
  status: z.enum([
    'NEW',
    'ANALYZING',
    'REVIEW',
    'INTERVIEW',
    'APPROVED',
    'REJECTED',
  ]).optional(),
  cidade: z.string().optional(),
  search: z.string().optional(),
  minScore: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  maxScore: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
});
