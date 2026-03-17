import type { User, Job, Candidate, PaymentMethod } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Interface para erros de API
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Token storage
let authToken: string | null = localStorage.getItem('talentdash_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('talentdash_token', token);
  } else {
    localStorage.removeItem('talentdash_token');
  }
};

export const getAuthToken = () => authToken;

// ==================== MOCK DATA (LOCALSTORAGE) ====================
// Fallback para quando o backend não está disponível
const MOCK_DB_KEY = 'talentdash_mock_db';

interface MockDB {
  users: User[];
  jobs: Job[];
  candidates: Candidate[];
  payments: PaymentMethod[];
}

const getMockDB = (): MockDB => {
  const stored = localStorage.getItem(MOCK_DB_KEY);
  if (stored) return JSON.parse(stored);
  return { users: [], jobs: [], candidates: [], payments: [] };
};

const saveMockDB = (db: MockDB) => {
  try {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
};

// Generate ID seguro usando crypto.randomUUID
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para ambientes sem crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// ==================== API REQUEST HELPER ====================
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  let responseOk = true;
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    responseOk = response.ok;
    const data = await response.json();
    
    if (!response.ok) {
      const error: ApiError = {
        message: data.error || 'Erro na requisição',
        status: response.status,
        code: data.code,
      };
      throw error;
    }
    
    return data;
  } catch (error: any) {
    // Se for erro de rede (backend offline) ou CORS, usar mock/localStorage
    const errorMessage = error?.message || '';
    const isNetworkError = error instanceof TypeError && (
      errorMessage.includes('fetch') || 
      errorMessage.includes('CORS') || 
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('Network request failed')
    );
    
    if (isNetworkError || !responseOk) {
      console.warn('API não disponível (CORS/offline), usando dados mock:', endpoint);
      return mockApiRequest<T>(endpoint, options);
    }
    // Se for erro de API, propagar
    throw error;
  }
}

// ==================== MOCK API (LOCALSTORAGE FALLBACK) ====================
async function mockApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay
  
  const db = getMockDB();
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : {};
  
  // AUTH endpoints
  if (endpoint === '/auth/register' && method === 'POST') {
    const { email, password, name, companyName, plan } = body;
    
    if (db.users.find(u => u.email === email)) {
      throw new Error('E-mail já cadastrado');
    }
    
    const user: User = {
      id: generateId(),
      email,
      name,
      companyName: companyName || '',
      plan: plan || 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentMethods: [],
    };
    
    const token = generateId();
    db.users.push({ ...user, password } as any);
    saveMockDB(db);
    setAuthToken(token);
    
    return { user, token } as T;
  }
  
  if (endpoint === '/auth/login' && method === 'POST') {
    const { email, password } = body;
    const user = db.users.find(u => u.email === email && (u as any).password === password);
    
    if (!user) {
      throw new Error('E-mail ou senha incorretos');
    }
    
    const token = generateId();
    setAuthToken(token);
    
    const { password: _, ...userWithoutPassword } = user as any;
    return { user: userWithoutPassword, token } as T;
  }
  
  if (endpoint === '/auth/me' && method === 'GET') {
    const user = db.users[0]; // Simplificado para MVP
    if (!user) throw new Error('Não autorizado');
    const { password: _, ...userWithoutPassword } = user as any;
    return userWithoutPassword as T;
  }
  
  // JOBS endpoints
  if (endpoint === '/jobs' && method === 'GET') {
    return db.jobs as T;
  }
  
  if (endpoint === '/jobs' && method === 'POST') {
    const job: Job = {
      id: generateId(),
      ...body,
      userId: db.users[0]?.id || '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.jobs.push(job);
    saveMockDB(db);
    return job as T;
  }
  
  if (endpoint.startsWith('/jobs/') && method === 'DELETE') {
    const id = endpoint.split('/')[2];
    db.jobs = db.jobs.filter(j => j.id !== id);
    db.candidates = db.candidates.filter(c => c.jobId !== id);
    saveMockDB(db);
    return undefined as T;
  }
  
  // CANDIDATES endpoints
  if (endpoint.endsWith('/candidates') && method === 'GET') {
    const jobId = endpoint.split('/')[2];
    return db.candidates.filter(c => c.jobId === jobId) as T;
  }
  
  // POST /jobs/{jobId}/candidates - criar candidato único
  if (endpoint.endsWith('/candidates') && method === 'POST') {
    const jobId = endpoint.split('/')[2];
    
    const newCandidate: Candidate = {
      id: generateId(),
      jobId,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    db.candidates.push(newCandidate);
    saveMockDB(db);
    
    return newCandidate as T;
  }
  
  if (endpoint.endsWith('/candidates/bulk') && method === 'POST') {
    const jobId = endpoint.split('/')[2];
    const { candidates } = body;
    
    const newCandidates = candidates.map((c: any) => ({
      ...c,
      id: generateId(),
      jobId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    db.candidates.push(...newCandidates);
    saveMockDB(db);
    
    return { message: 'Candidatos adicionados', candidates: newCandidates } as T;
  }
  
  // Default: retornar array vazio ou objeto vazio
  return [] as T;
}

// ==================== AUTH ====================

export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    companyName?: string;
    plan?: string;
  }): Promise<{ user: User; token: string }> => {
    const result = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(result.token);
    return result;
  },
  
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const result = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(result.token);
    return result;
  },
  
  getMe: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },
  
  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  changePlan: async (plan: string): Promise<User> => {
    return apiRequest<User>('/auth/plan', {
      method: 'PUT',
      body: JSON.stringify({ plan }),
    });
  },
  
  logout: () => {
    setAuthToken(null);
  },
};

// ==================== JOBS ====================

export const jobsAPI = {
  getAll: async (): Promise<Job[]> => {
    return apiRequest<Job[]>('/jobs');
  },
  
  getById: async (id: string): Promise<Job> => {
    return apiRequest<Job>(`/jobs/${id}`);
  },
  
  create: async (data: Omit<Job, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
    return apiRequest<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: Partial<Job>): Promise<Job> => {
    return apiRequest<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CANDIDATES ====================

export const candidatesAPI = {
  getAll: async (jobId: string): Promise<Candidate[]> => {
    return apiRequest<Candidate[]>(`/jobs/${jobId}/candidates`);
  },
  
  getById: async (jobId: string, id: string): Promise<Candidate> => {
    return apiRequest<Candidate>(`/jobs/${jobId}/candidates/${id}`);
  },
  
  create: async (jobId: string, data: Omit<Candidate, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>): Promise<Candidate> => {
    return apiRequest<Candidate>(`/jobs/${jobId}/candidates`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  createBulk: async (jobId: string, candidates: Omit<Candidate, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>[]): Promise<{ message: string; candidates: Candidate[] }> => {
    return apiRequest<{ message: string; candidates: Candidate[] }>(`/jobs/${jobId}/candidates/bulk`, {
      method: 'POST',
      body: JSON.stringify({ candidates }),
    });
  },
  
  update: async (jobId: string, id: string, data: Partial<Candidate>): Promise<Candidate> => {
    return apiRequest<Candidate>(`/jobs/${jobId}/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (jobId: string, id: string): Promise<void> => {
    return apiRequest<void>(`/jobs/${jobId}/candidates/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PAYMENTS ====================

export const paymentsAPI = {
  getAll: async (): Promise<PaymentMethod[]> => {
    return apiRequest<PaymentMethod[]>('/payments');
  },
  
  create: async (data: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    return apiRequest<PaymentMethod>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  setDefault: async (id: string): Promise<void> => {
    return apiRequest<void>(`/payments/${id}/default`, {
      method: 'PUT',
    });
  },
  
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/payments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== HEALTH ====================

export const healthAPI = {
  check: async (): Promise<{ status: string; timestamp: string; version: string }> => {
    return apiRequest('/health');
  },
};
