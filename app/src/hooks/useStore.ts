import { useState, useCallback, useEffect } from 'react';
import type { 
  ViewType, 
  Job, 
  Candidate, 
  AppState,
  PlanType,
  CustomField,
  JobTemplateType,
  DashboardModel,
  ColorTheme,
  User,
  PaymentMethod
} from '@/types';
import { 
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  fetchUserProfile,
  createUserProfile,
  fetchJobs,
  createJob as createJobDb,
  updateJob as updateJobDb,
  deleteJob as deleteJobDb,
  fetchCandidates,
  createCandidate as createCandidateDb,
  updateCandidate as updateCandidateDb,
  deleteCandidate as deleteCandidateDb,
} from '@/lib/supabase';

// Estado inicial
const initialState: AppState = {
  currentView: 'landing',
  user: null,
  isAuthenticated: false,
  selectedJob: null,
  selectedCandidate: null,
  jobs: [],
  candidates: [],
};

// Helper para converter snake_case do Supabase para camelCase do frontend
const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
};

// Helper para converter camelCase do frontend para snake_case do Supabase
const camelToSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
};

// Hook de estado global
export function useStore() {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user && isMounted) {
          await loadUser(user.id);
        }
      } catch (err) {
        console.error('Failed to check auth:', err);
      }
    };
    
    initAuth();
    
    return () => { isMounted = false; };
  }, []);

  // Load user from session
  const loadUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const profile = await fetchUserProfile(userId);
      if (profile) {
        const userWithCamel = snakeToCamel(profile);
        setState(prev => ({
          ...prev,
          user: userWithCamel,
          isAuthenticated: true,
        }));
        // Load user's jobs
        await loadJobs(userId);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      // Session might be invalid
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  // Navegação
  const navigateTo = useCallback((view: ViewType) => {
    setState(prev => ({ ...prev, currentView: view }));
    // Atualiza o URL hash para permitir navegação com back button
    window.history.pushState({ view }, '', `#${view}`);
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Se usuário está logado e tenta voltar para landing/login/register,
      // redireciona para o dashboard
      if (state.isAuthenticated) {
        const currentView = state.currentView;
        const isAuthPage = ['landing', 'login', 'register'].includes(currentView);
        
        if (isAuthPage) {
          // Previne navegação para páginas de auth quando logado
          event.preventDefault();
          navigateTo('user-dashboard');
        } else {
          // Permite navegação normal entre views autenticadas
          const newView = (event.state?.view as ViewType) || 'user-dashboard';
          setState(prev => ({ ...prev, currentView: newView }));
        }
      } else {
        // Usuário não logado - permite navegação normal
        const newView = (event.state?.view as ViewType) || 'landing';
        setState(prev => ({ ...prev, currentView: newView }));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [state.isAuthenticated, state.currentView]);

  // ============ AUTENTICAÇÃO ============
  
  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { user } = await signInWithEmail(email, password);
      
      if (!user) {
        throw new Error('Erro ao fazer login');
      }
      
      // Load user profile
      const profile = await fetchUserProfile(user.id);
      if (!profile) {
        throw new Error('Perfil não encontrado');
      }
      
      const userWithCamel = snakeToCamel(profile);
      
      setState(prev => ({
        ...prev,
        user: userWithCamel,
        isAuthenticated: true,
        currentView: 'user-dashboard',
      }));
      
      // Load user's jobs
      await loadJobs(user.id);
      
      return userWithCamel;
    } catch (err: any) {
      const message = err.message || 'Erro ao fazer login';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Registro
  const register = useCallback(async (data: { 
    name: string; 
    email: string; 
    password: string; 
    companyName?: string;
    plan?: PlanType;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Criar usuário no auth
      const { user } = await signUpWithEmail(data.email, data.password, data.name, data.companyName);
      
      if (!user) {
        throw new Error('Erro ao criar conta');
      }
      
      // Criar perfil do usuário
      const userProfile = await createUserProfile({
        id: user.id,
        email: data.email,
        name: data.name,
        company_name: data.companyName || '',
        plan: data.plan || 'free',
        role: 'USER',
        payment_methods: [],
      } as Partial<User>);
      
      const userWithCamel = snakeToCamel(userProfile);
      
      // Atualiza estado e redireciona para dashboard
      setState(prev => ({
        ...prev,
        user: userWithCamel,
        isAuthenticated: true,
        currentView: 'user-dashboard',
      }));
      
      return userWithCamel;
    } catch (err: any) {
      const message = err.message || 'Erro ao criar conta';
      if (message.includes('already exists') || message.includes('já cadastrado')) {
        setError('E-mail já cadastrado');
      } else {
        setError(message);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await signOut();
      setState(initialState);
    } catch (err) {
      console.error('Logout error:', err);
      setState(initialState);
    }
  }, []);

  // Atualizar perfil do usuário
  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .update(camelToSnake(updates))
        .eq('id', state.user?.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const userWithCamel = snakeToCamel(data);
      setState(prev => ({
        ...prev,
        user: userWithCamel,
      }));
      return userWithCamel;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.user?.id]);

  // Mudar plano do usuário
  const changePlan = useCallback(async (newPlan: PlanType) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .update({ plan: newPlan })
        .eq('id', state.user?.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const userWithCamel = snakeToCamel(data);
      setState(prev => ({
        ...prev,
        user: userWithCamel,
      }));
      return userWithCamel;
    } catch (err: any) {
      setError(err.message || 'Erro ao mudar plano');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.user?.id]);

  // ============ GOOGLE OAUTH LOGIN ============
  const googleLogin = useCallback(async (_accessToken: string, _userInfo?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Iniciar OAuth com Google - isso redireciona para o Google
      await signInWithGoogle();
      
      // O redirecionamento do OAuth vai retornar para a página
      // A lógica de callback deve ser tratada no componente de auth callback
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login com Google');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ JOBS (MAPEAMENTOS) ============
  
  // Carregar jobs do usuário
  const loadJobs = async (userId?: string) => {
    try {
      const currentUserId = userId || state.user?.id;
      if (!currentUserId) return [];
      
      const jobs = await fetchJobs(currentUserId);
      const jobsWithCamel = snakeToCamel(jobs);
      setState(prev => ({ ...prev, jobs: jobsWithCamel }));
      return jobsWithCamel;
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
      return [];
    }
  };

  // Criar nova vaga
  const createJob = useCallback(async (
    name: string, 
    plan: PlanType, 
    customFields: CustomField[], 
    options?: {
      companyLogo?: string;
      template?: JobTemplateType;
      dashboardModel?: DashboardModel;
      colorTheme?: ColorTheme;
      description?: string;
    }
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!state.user?.id) {
        throw new Error('Usuário não autenticado');
      }
      
      const jobData = {
        name,
        plan,
        custom_fields: customFields,
        description: options?.description,
        template: options?.template || 'blank',
        dashboard_model: options?.dashboardModel || 'padrao',
        color_theme: options?.colorTheme || 'blue',
        user_id: state.user.id,
      };
      
      const newJob = await createJobDb(jobData);
      const jobWithCamel = snakeToCamel(newJob);
      
      setState(prev => ({
        ...prev,
        jobs: [...prev.jobs, jobWithCamel],
        selectedJob: jobWithCamel,
      }));
      
      return jobWithCamel;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar mapeamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.user?.id]);

  // Atualizar job
  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    try {
      setIsLoading(true);
      
      const updatesWithSnake = camelToSnake(updates);
      const updatedJob = await updateJobDb(jobId, updatesWithSnake);
      const jobWithCamel = snakeToCamel(updatedJob);
      
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === jobId ? jobWithCamel : j),
        selectedJob: prev.selectedJob?.id === jobId ? jobWithCamel : prev.selectedJob,
      }));
      
      return jobWithCamel;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar mapeamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Excluir job
  const deleteJob = useCallback(async (jobId: string) => {
    try {
      setIsLoading(true);
      await deleteJobDb(jobId);
      
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.filter(j => j.id !== jobId),
        candidates: prev.candidates.filter(c => c.jobId !== jobId),
        selectedJob: prev.selectedJob?.id === jobId ? null : prev.selectedJob,
      }));
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir mapeamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Selecionar job
  const selectJob = useCallback(async (job: Job | null) => {
    setState(prev => ({ ...prev, selectedJob: job }));
    
    // Load candidates for this job
    if (job) {
      try {
        const candidates = await fetchCandidates(job.id);
        const candidatesWithCamel = snakeToCamel(candidates);
        setState(prev => ({ ...prev, candidates: candidatesWithCamel }));
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
    }
  }, []);

  // ============ CANDIDATOS ============
  
  // Adicionar candidatos em massa
  const addCandidates = useCallback(async (candidates: Candidate[]) => {
    if (!state.selectedJob) return;
    
    try {
      setIsLoading(true);
      
      const createdCandidates: Candidate[] = [];
      for (const c of candidates) {
        const candidateData = {
          job_id: state.selectedJob.id,
          nome: c.nome,
          idade: c.idade,
          cidade: c.cidade,
          curriculo: c.curriculo,
          pretensao_salarial: c.pretensaoSalarial,
          salario_atual: c.salarioAtual,
          status: c.status,
          observacoes: c.observacoes,
          custom_fields: c.customFields,
        };
        
        const newCandidate = await createCandidateDb(candidateData);
        createdCandidates.push(snakeToCamel(newCandidate));
      }
      
      setState(prev => ({
        ...prev,
        candidates: [...prev.candidates, ...createdCandidates],
      }));
      
      return createdCandidates;
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar candidatos');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedJob]);

  // Adicionar candidato único
  const addCandidate = useCallback(async (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!state.selectedJob) return;
    
    try {
      setIsLoading(true);
      
      const candidateData = {
        job_id: state.selectedJob.id,
        nome: candidate.nome,
        idade: candidate.idade,
        cidade: candidate.cidade,
        curriculo: candidate.curriculo,
        pretensao_salarial: candidate.pretensaoSalarial,
        salario_atual: candidate.salarioAtual,
        status: candidate.status,
        observacoes: candidate.observacoes,
        custom_fields: candidate.customFields,
      };
      
      const newCandidate = await createCandidateDb(candidateData);
      const candidateWithCamel = snakeToCamel(newCandidate);
      
      setState(prev => ({
        ...prev,
        candidates: [...prev.candidates, candidateWithCamel],
      }));
      
      return candidateWithCamel;
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar candidato');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedJob]);

  // Atualizar candidato
  const updateCandidate = useCallback(async (candidateId: string, updates: Partial<Candidate>) => {
    if (!state.selectedJob) return;
    
    try {
      setIsLoading(true);
      
      const updatesWithSnake = camelToSnake(updates);
      const updatedCandidate = await updateCandidateDb(candidateId, updatesWithSnake);
      const candidateWithCamel = snakeToCamel(updatedCandidate);
      
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.map(c => 
          c.id === candidateId ? candidateWithCamel : c
        ),
      }));
      
      return candidateWithCamel;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar candidato');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedJob]);

  // Adicionar candidatos localmente (sem API) - para modo demo
  const addLocalCandidates = useCallback((candidates: Candidate[]) => {
    setState(prev => ({
      ...prev,
      candidates: [...prev.candidates, ...candidates],
    }));
  }, []);

  // Excluir candidato
  const deleteCandidate = useCallback(async (candidateId: string) => {
    if (!state.selectedJob) return;
    
    try {
      setIsLoading(true);
      await deleteCandidateDb(candidateId);
      
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.filter(c => c.id !== candidateId),
      }));
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir candidato');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedJob]);

  // Obter candidatos de uma vaga
  const getJobCandidates = useCallback((jobId: string) => {
    return state.candidates.filter(c => c.jobId === jobId);
  }, [state.candidates]);

  // Selecionar candidato
  const selectCandidate = useCallback((candidate: Candidate | null) => {
    setState(prev => ({ ...prev, selectedCandidate: candidate }));
  }, []);

  // ============ PAYMENT METHODS ============
  
  // Adicionar método de pagamento
  const addPaymentMethod = useCallback(async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
    try {
      setIsLoading(true);
      
      const newMethods = [...(state.user?.paymentMethods || []), paymentMethod];
      const { data, error } = await supabase
        .from('users')
        .update({ payment_methods: newMethods })
        .eq('id', state.user?.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const userWithCamel = snakeToCamel(data);
      setState(prev => ({
        ...prev,
        user: userWithCamel,
      }));
      
      return paymentMethod;
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar método de pagamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.user?.id, state.user?.paymentMethods]);

  // Remover método de pagamento
  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setIsLoading(true);
      
      const newMethods = state.user?.paymentMethods?.filter(pm => pm.id !== paymentMethodId) || [];
      const { data, error } = await supabase
        .from('users')
        .update({ payment_methods: newMethods })
        .eq('id', state.user?.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const userWithCamel = snakeToCamel(data);
      setState(prev => ({
        ...prev,
        user: userWithCamel,
      }));
    } catch (err: any) {
      setError(err.message || 'Erro ao remover método de pagamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.user?.id, state.user?.paymentMethods]);

  // Definir método de pagamento padrão
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setIsLoading(true);
      
      const newMethods = state.user?.paymentMethods?.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      })) || [];
      
      const { data, error } = await supabase
        .from('users')
        .update({ payment_methods: newMethods })
        .eq('id', state.user?.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const userWithCamel = snakeToCamel(data);
      setState(prev => ({
        ...prev,
        user: userWithCamel,
      }));
    } catch (err: any) {
      setError(err.message || 'Erro ao definir método padrão');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.user?.id, state.user?.paymentMethods]);

  // Resetar estado
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state,
    isLoading,
    error,
    navigateTo,
    // Auth
    login,
    googleLogin,
    register,
    logout,
    updateUserProfile,
    changePlan,
    // Jobs
    createJob,
    updateJob,
    deleteJob,
    selectJob,
    // Candidates
    addCandidates,
    addCandidate,
    addLocalCandidates,
    updateCandidate,
    deleteCandidate,
    getJobCandidates,
    selectCandidate,
    // Payments
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    // Utils
    resetState,
    clearError,
  };
}

export type Store = ReturnType<typeof useStore>;
