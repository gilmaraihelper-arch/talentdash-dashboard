import { Request } from 'express';
import { User, Plan, CandidateStatus, PaymentType } from '@prisma/client';

// Tipos extendidos do Prisma
export type { User, Plan, CandidateStatus, PaymentType };

// User sem a senha (para retornar nas APIs)
export type SafeUser = Omit<User, 'password'>;

// Request autenticado
export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

// Payload do JWT
export interface JWTPayload {
  userId: string;
  email: string;
  plan: Plan;
}

// Resposta padronizada da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Filtros de paginação
export interface PaginationParams {
  page: number;
  limit: number;
}

// Filtros de candidatos
export interface CandidateFilters {
  status?: CandidateStatus;
  cidade?: string;
  search?: string;
  minScore?: number;
  maxScore?: number;
}

// Dados para criação de usuário
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

// Dados para login
export interface LoginInput {
  email: string;
  password: string;
}

// Dados para criação de job
export interface CreateJobInput {
  name: string;
  description?: string;
  template?: string;
  colorTheme?: string;
  customFields?: Record<string, unknown>;
}

// Dados para criação de candidato
export interface CreateCandidateInput {
  nome: string;
  idade?: number;
  cidade?: string;
  estado?: string;
  email?: string;
  telefone?: string;
  linkedin?: string;
  portfolio?: string;
  experiencia?: Array<{
    empresa: string;
    cargo: string;
    periodo: string;
    descricao?: string;
  }>;
  formacao?: Array<{
    instituicao: string;
    curso: string;
    periodo: string;
  }>;
  habilidades?: string[];
  pretensaoSalarial?: number;
  customData?: Record<string, unknown>;
}

// Dados para criação de método de pagamento
export interface CreatePaymentMethodInput {
  type: PaymentType;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  holderName?: string;
  pixKey?: string;
  externalId?: string;
  isDefault?: boolean;
}