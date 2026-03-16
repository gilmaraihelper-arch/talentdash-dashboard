import { z } from 'zod';

// Schema para Login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema para Registro
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  companyName: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de serviço',
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schema para Criar Job (Etapa 1 - Informações)
export const jobInfoSchema = z.object({
  jobName: z
    .string()
    .min(1, 'Nome do mapeamento é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  jobDescription: z.string().max(500, 'Descrição muito longa').optional(),
});

export type JobInfoFormData = z.infer<typeof jobInfoSchema>;

// Schema para Campo Personalizado
export const customFieldSchema = z.object({
  fieldName: z
    .string()
    .min(1, 'Nome do campo é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo'),
  fieldType: z.enum(['text', 'number', 'rating', 'select', 'boolean', 'link']),
  fieldOptions: z.string().optional(),
  fieldIcon: z.string(),
  visibility: z.object({
    card: z.boolean(),
    table: z.boolean(),
    detail: z.boolean(),
  }),
});

export type CustomFieldFormData = z.infer<typeof customFieldSchema>;

// Schema para Candidato
export const candidateStatusSchema = z.enum([
  'triagem',
  'entrevista',
  'teste',
  'offer',
  'contratado',
  'reprovado',
]);

export const candidateSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  idade: z
    .number()
    .min(1, 'Idade é obrigatória')
    .int('Idade deve ser um número inteiro')
    .min(18, 'Idade mínima é 18 anos')
    .max(100, 'Idade máxima é 100 anos'),
  cidade: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  curriculo: z
    .string()
    .url('URL do currículo inválida')
    .optional()
    .or(z.literal('')),
  pretensaoSalarial: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .optional(),
  salarioAtual: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .optional(),
  status: candidateStatusSchema,
  observacoes: z.string().max(2000, 'Observações muito longas').optional(),
});

export type CandidateFormData = z.infer<typeof candidateSchema>;
