// ============================================
// TIPOS DO SISTEMA DE RECRUTAMENTO
// ============================================

// Tipos de planos disponíveis
export type PlanType = 'free' | 'pro' | 'advanced' | 'enterprise';

// Tipos de templates de vagas
export type JobTemplateType = 'blank' | 'vendas' | 'ti' | 'operacional';

// Modelos de dashboard
export type DashboardModel = 'padrao' | 'analitico' | 'comparativo' | 'minimalista';

// Tema de cores
export type ColorTheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';

// Tipos de campos personalizáveis
export type FieldType = 'text' | 'number' | 'rating' | 'select' | 'boolean' | 'link';

// Status do candidato no funil
export type CandidateStatus = 
  | 'triagem' 
  | 'entrevista' 
  | 'teste' 
  | 'offer' 
  | 'contratado' 
  | 'reprovado';

// Onde o campo aparece
export type FieldVisibility = {
  card: boolean;
  table: boolean;
  detail: boolean;
};

// Campo personalizado da vaga
export interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  icon: string;
  visibility: FieldVisibility;
  options?: string[]; // Para campos do tipo select
  maxRating?: number; // Para campos do tipo rating (padrão: 5)
}

// Configuração do plano
export interface PlanConfig {
  type: PlanType;
  name: string;
  maxCustomFields: number;
  features: string[];
  price: string;
}

// Vaga de emprego
export interface Job {
  id: string;
  name: string;
  plan: PlanType;
  companyLogo?: string;
  createdAt: Date;
  customFields: CustomField[];
  // Novas propriedades de personalização
  template?: JobTemplateType;
  dashboardModel: DashboardModel;
  colorTheme: ColorTheme;
  description?: string;
}

// Candidato
export interface Candidate {
  id: string;
  jobId: string;
  // Campos básicos obrigatórios
  nome: string;
  idade: number;
  cidade: string;
  curriculo: string; // URL ou nome do arquivo
  pretensaoSalarial: number;
  salarioAtual: number;
  status: CandidateStatus;
  observacoes: string;
  // Campos personalizados (dinâmicos)
  customFields: Record<string, any>;
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

// Estado do funil para dashboard
export interface FunnelData {
  status: CandidateStatus;
  count: number;
  label: string;
  color: string;
}

// Dados para gráficos
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// Estatísticas da vaga
export interface JobStats {
  totalCandidates: number;
  averageSalary: number;
  statusDistribution: FunnelData[];
  customFieldStats: Record<string, ChartData[]>;
}

// View/Navigation state
export type ViewType = 
  | 'landing' 
  | 'login'
  | 'register'
  | 'user-dashboard'
  | 'create-job' 
  | 'data-structure' 
  | 'add-candidates' 
  | 'dashboard' 
  | 'candidate-detail'
  | 'admin';

// Método de pagamento
export type PaymentMethodType = 'credit_card' | 'pix' | 'boleto';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  last4?: string; // Para cartão
  brand?: string; // Visa, Mastercard, etc
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
}

// Usuário
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  avatar?: string;
  plan: PlanType;
  planExpiryDate?: Date;
  paymentMethods: PaymentMethod[];
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Estado global da aplicação
export interface AppState {
  currentView: ViewType;
  user: User | null;
  isAuthenticated: boolean;
  selectedJob: Job | null;
  selectedCandidate: Candidate | null;
  jobs: Job[];
  candidates: Candidate[];
}

// Configuração de campos básicos
export const BASIC_FIELDS: CustomField[] = [
  { id: 'nome', name: 'Nome do candidato', type: 'text', icon: 'User', visibility: { card: true, table: true, detail: true } },
  { id: 'idade', name: 'Idade', type: 'number', icon: 'Calendar', visibility: { card: false, table: true, detail: true } },
  { id: 'cidade', name: 'Cidade', type: 'text', icon: 'MapPin', visibility: { card: true, table: true, detail: true } },
  { id: 'curriculo', name: 'Currículo', type: 'link', icon: 'FileText', visibility: { card: false, table: true, detail: true } },
  { id: 'pretensaoSalarial', name: 'Pretensão salarial', type: 'number', icon: 'TrendingUp', visibility: { card: false, table: true, detail: true } },
  { id: 'salarioAtual', name: 'Salário atual', type: 'number', icon: 'DollarSign', visibility: { card: false, table: false, detail: true } },
  { id: 'status', name: 'Status no processo', type: 'select', icon: 'Status', visibility: { card: true, table: true, detail: true }, options: ['triagem', 'entrevista', 'teste', 'offer', 'contratado', 'reprovado'] },
  { id: 'observacoes', name: 'Observações da entrevista', type: 'text', icon: 'MessageSquare', visibility: { card: false, table: false, detail: true } },
];

// Configuração dos planos
export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    type: 'free',
    name: 'Free',
    maxCustomFields: 0,
    price: 'Grátis',
    features: [
      'Campos básicos obrigatórios',
      'Dashboard simples',
      'Até 50 candidatos por vaga',
      'Exportação CSV',
    ],
  },
  pro: {
    type: 'pro',
    name: 'Pro',
    maxCustomFields: 5,
    price: 'R$ 49/mês',
    features: [
      'Todos os campos básicos',
      'Até 5 campos personalizáveis',
      'Dashboard completo',
      'Candidatos ilimitados',
      'Importação/Exportação',
    ],
  },
  advanced: {
    type: 'advanced',
    name: 'Advanced',
    maxCustomFields: 15,
    price: 'R$ 99/mês',
    features: [
      'Todos os campos básicos',
      'Até 15 campos personalizáveis',
      'Dashboard avançado com analytics',
      'Templates de vagas',
      'API access',
    ],
  },
  enterprise: {
    type: 'enterprise',
    name: 'Enterprise',
    maxCustomFields: Infinity,
    price: 'Sob consulta',
    features: [
      'Campos personalizados ilimitados',
      'Dashboard enterprise',
      'SSO e segurança avançada',
      'Suporte dedicado',
      'Customizações',
    ],
  },
};

// Labels para status
export const STATUS_LABELS: Record<CandidateStatus, string> = {
  triagem: 'Triagem',
  entrevista: 'Entrevista',
  teste: 'Teste Técnico',
  offer: 'Offer',
  contratado: 'Contratado',
  reprovado: 'Reprovado',
};

// Cores para status
export const STATUS_COLORS: Record<CandidateStatus, string> = {
  triagem: '#94a3b8',
  entrevista: '#60a5fa',
  teste: '#fbbf24',
  offer: '#a78bfa',
  contratado: '#34d399',
  reprovado: '#f87171',
};

// Ícones disponíveis para campos
export const FIELD_ICONS = [
  'User', 'Mail', 'Phone', 'MapPin', 'Calendar', 'Briefcase', 
  'GraduationCap', 'Star', 'Link', 'FileText', 'MessageSquare',
  'CheckCircle', 'XCircle', 'Award', 'TrendingUp', 'DollarSign',
  'Globe', 'Github', 'Linkedin', 'BookOpen', 'Code', 'Palette'
];

// Configuração dos templates de vagas
export const JOB_TEMPLATES: Record<JobTemplateType, { 
  name: string; 
  description: string; 
  icon: string;
  suggestedFields: Partial<CustomField>[];
}> = {
  blank: {
    name: 'Em branco',
    description: 'Comece do zero e personalize conforme suas necessidades',
    icon: 'FileText',
    suggestedFields: [],
  },
  vendas: {
    name: 'Vendas',
    description: 'Ideal para vagas de representante comercial, SDR, BDR e account executives',
    icon: 'TrendingUp',
    suggestedFields: [
      { name: 'Anos em vendas', type: 'number', icon: 'Briefcase', visibility: { card: false, table: true, detail: true } },
      { name: 'Experiência com CRM', type: 'select', icon: 'CheckCircle', visibility: { card: true, table: true, detail: true }, options: ['Nenhuma', 'Básica', 'Intermediária', 'Avançada'] },
      { name: 'Habilidade de negociação', type: 'rating', icon: 'Star', visibility: { card: true, table: false, detail: true }, maxRating: 5 },
      { name: 'Portfólio de clientes', type: 'number', icon: 'Users', visibility: { card: false, table: true, detail: true } },
      { name: 'Meta atingida último ano', type: 'select', icon: 'Award', visibility: { card: true, table: true, detail: true }, options: ['Abaixo de 70%', '70-90%', '90-100%', 'Acima de 100%'] },
      { name: 'Disponibilidade para viagens', type: 'boolean', icon: 'MapPin', visibility: { card: true, table: true, detail: true } },
      { name: 'LinkedIn', type: 'link', icon: 'Linkedin', visibility: { card: false, table: true, detail: true } },
    ],
  },
  ti: {
    name: 'Tecnologia (TI)',
    description: 'Perfeito para desenvolvedores, analistas, QA e profissionais de tech',
    icon: 'Code',
    suggestedFields: [
      { name: 'Anos de experiência', type: 'number', icon: 'Briefcase', visibility: { card: false, table: true, detail: true } },
      { name: 'Nível de Inglês', type: 'select', icon: 'Globe', visibility: { card: true, table: true, detail: true }, options: ['Básico', 'Intermediário', 'Avançado', 'Fluente'] },
      { name: 'Domínio técnico principal', type: 'rating', icon: 'Star', visibility: { card: true, table: false, detail: true }, maxRating: 5 },
      { name: 'GitHub', type: 'link', icon: 'Github', visibility: { card: false, table: true, detail: true } },
      { name: 'Portfólio/LinkedIn', type: 'link', icon: 'Linkedin', visibility: { card: false, table: true, detail: true } },
      { name: 'Certificações relevantes', type: 'boolean', icon: 'Award', visibility: { card: true, table: true, detail: true } },
      { name: 'Disponível para remoto', type: 'boolean', icon: 'CheckCircle', visibility: { card: true, table: true, detail: true } },
    ],
  },
  operacional: {
    name: 'Operacional',
    description: 'Para cargos operacionais, produção, logística e field service',
    icon: 'Settings',
    suggestedFields: [
      { name: 'Experiência na área', type: 'number', icon: 'Briefcase', visibility: { card: false, table: true, detail: true } },
      { name: 'Disponibilidade de horário', type: 'select', icon: 'Clock', visibility: { card: true, table: true, detail: true }, options: ['Diurno', 'Noturno', 'Madrugada', 'Flexível'] },
      { name: 'Possui veículo próprio', type: 'boolean', icon: 'Car', visibility: { card: true, table: true, detail: true } },
      { name: 'CNH adequada', type: 'boolean', icon: 'CheckCircle', visibility: { card: true, table: true, detail: true } },
      { name: 'Disponibilidade para turnos', type: 'boolean', icon: 'Calendar', visibility: { card: false, table: true, detail: true } },
      { name: 'Reside próximo ao local', type: 'select', icon: 'MapPin', visibility: { card: true, table: true, detail: true }, options: ['Menos de 5km', '5-10km', '10-20km', 'Mais de 20km'] },
      { name: 'Avaliação prática', type: 'rating', icon: 'Star', visibility: { card: true, table: false, detail: true }, maxRating: 5 },
    ],
  },
};

// Configuração dos modelos de dashboard
export const DASHBOARD_MODELS: Record<DashboardModel, {
  name: string;
  description: string;
  icon: string;
  features: string[];
}> = {
  padrao: {
    name: 'Padrão',
    description: 'Dashboard equilibrado com visão geral e detalhes',
    icon: 'LayoutDashboard',
    features: ['Funil de candidatos', 'Gráficos de distribuição', 'Lista detalhada', 'KPIs principais'],
  },
  analitico: {
    name: 'Analítico',
    description: 'Focado em métricas, estatísticas e análise profunda',
    icon: 'BarChart3',
    features: ['Múltiplos gráficos', 'Análise comparativa', 'Tendências', 'Estatísticas avançadas'],
  },
  comparativo: {
    name: 'Comparativo',
    description: 'Ideal para comparar candidados lado a lado',
    icon: 'Columns',
    features: ['Tabela comparativa', 'Cards lado a lado', 'Destaque de diferenças', 'Ranking automático'],
  },
  minimalista: {
    name: 'Minimalista',
    description: 'Visual limpo e direto, sem distrações',
    icon: 'Minimize2',
    features: ['Lista simplificada', 'Apenas dados essenciais', 'Carregamento rápido', 'Foco na decisão'],
  },
};

// Configuração dos temas de cores - Paleta refinada
export const COLOR_THEMES: Record<ColorTheme, {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}> = {
  blue: {
    name: 'Indigo Profissional',
    primary: '#4F46E5', // Indigo 600
    secondary: '#6366F1', // Indigo 500
    accent: '#818CF8', // Indigo 400
    gradient: 'from-indigo-500 to-indigo-700',
  },
  green: {
    name: 'Esmeralda',
    primary: '#059669', // Emerald 600
    secondary: '#10B981', // Emerald 500
    accent: '#34D399', // Emerald 400
    gradient: 'from-emerald-500 to-emerald-700',
  },
  purple: {
    name: 'Violeta',
    primary: '#7C3AED', // Violet 600
    secondary: '#8B5CF6', // Violet 500
    accent: '#A78BFA', // Violet 400
    gradient: 'from-violet-500 to-violet-700',
  },
  orange: {
    name: 'Âmbar',
    primary: '#D97706', // Amber 600
    secondary: '#F59E0B', // Amber 500
    accent: '#FBBF24', // Amber 400
    gradient: 'from-amber-500 to-amber-700',
  },
  red: {
    name: 'Rosa',
    primary: '#DB2777', // Pink 600
    secondary: '#EC4899', // Pink 500
    accent: '#F472B6', // Pink 400
    gradient: 'from-pink-500 to-pink-700',
  },
  teal: {
    name: 'Ciano',
    primary: '#0891B2', // Cyan 600
    secondary: '#06B6D4', // Cyan 500
    accent: '#22D3EE', // Cyan 400
    gradient: 'from-cyan-500 to-cyan-700',
  },
};
