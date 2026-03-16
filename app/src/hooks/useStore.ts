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
import { authAPI, jobsAPI, candidatesAPI, paymentsAPI, getAuthToken } from '@/services/api';

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

// Hook de estado global
export function useStore() {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const token = getAuthToken();
      if (token && isMounted) {
        await loadUser();
      }
    };
    
    initAuth();
    
    return () => { isMounted = false; };
  }, []);

  // Load user from token
  const loadUser = async () => {
    try {
      setIsLoading(true);
      const user = await authAPI.getMe();
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));
      // Load user's jobs
      await loadJobs();
    } catch (err) {
      console.error('Failed to load user:', err);
      // Token might be invalid, clear it
      authAPI.logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Navegação
  const navigateTo = useCallback((view: ViewType) => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  // ============ AUTENTICAÇÃO ============
  
  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user } = await authAPI.login(email, password);
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        currentView: 'user-dashboard',
      }));
      
      // Load user's jobs
      await loadJobs();
      
      return user;
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
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
      const { user } = await authAPI.register(data);
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        currentView: 'user-dashboard',
      }));
      
      return user;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    authAPI.logout();
    setState(initialState);
  }, []);

  // Atualizar perfil do usuário
  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    try {
      setIsLoading(true);
      const user = await authAPI.updateProfile(updates);
      setState(prev => ({
        ...prev,
        user,
      }));
      return user;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mudar plano do usuário
  const changePlan = useCallback(async (newPlan: PlanType) => {
    try {
      setIsLoading(true);
      const user = await authAPI.changePlan(newPlan);
      setState(prev => ({
        ...prev,
        user,
      }));
      return user;
    } catch (err: any) {
      setError(err.message || 'Erro ao mudar plano');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ JOBS (MAPEAMENTOS) ============
  
  // Carregar jobs do usuário
  const loadJobs = async () => {
    try {
      const jobs = await jobsAPI.getAll();
      setState(prev => ({ ...prev, jobs }));
      return jobs;
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
      
      const newJob = await jobsAPI.create({
        name,
        plan,
        customFields,
        description: options?.description,
        template: options?.template || 'blank',
        dashboardModel: options?.dashboardModel || 'padrao',
        colorTheme: options?.colorTheme || 'blue',
      });
      
      setState(prev => ({
        ...prev,
        jobs: [...prev.jobs, newJob],
        selectedJob: newJob,
      }));
      
      return newJob;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar mapeamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar job
  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    try {
      setIsLoading(true);
      const updatedJob = await jobsAPI.update(jobId, updates);
      
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === jobId ? updatedJob : j),
        selectedJob: prev.selectedJob?.id === jobId ? updatedJob : prev.selectedJob,
      }));
      
      return updatedJob;
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
      await jobsAPI.delete(jobId);
      
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
        const candidates = await candidatesAPI.getAll(job.id);
        setState(prev => ({ ...prev, candidates }));
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
      const result = await candidatesAPI.createBulk(
        state.selectedJob.id,
        candidates.map(c => ({
          nome: c.nome,
          idade: c.idade,
          cidade: c.cidade,
          curriculo: c.curriculo,
          pretensaoSalarial: c.pretensaoSalarial,
          salarioAtual: c.salarioAtual,
          status: c.status,
          observacoes: c.observacoes,
          customFields: c.customFields,
        }))
      );
      
      setState(prev => ({
        ...prev,
        candidates: [...prev.candidates, ...result.candidates],
      }));
      
      return result.candidates;
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
      const newCandidate = await candidatesAPI.create(state.selectedJob.id, candidate);
      
      setState(prev => ({
        ...prev,
        candidates: [...prev.candidates, newCandidate],
      }));
      
      return newCandidate;
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
      const updatedCandidate = await candidatesAPI.update(
        state.selectedJob.id,
        candidateId,
        updates
      );
      
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.map(c => 
          c.id === candidateId ? updatedCandidate : c
        ),
      }));
      
      return updatedCandidate;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar candidato');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedJob]);

  // Excluir candidato
  const deleteCandidate = useCallback(async (candidateId: string) => {
    if (!state.selectedJob) return;
    
    try {
      setIsLoading(true);
      await candidatesAPI.delete(state.selectedJob.id, candidateId);
      
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
      const newMethod = await paymentsAPI.create(paymentMethod);
      
      setState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          paymentMethods: [...(prev.user.paymentMethods || []), newMethod],
        } : null,
      }));
      
      return newMethod;
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar método de pagamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remover método de pagamento
  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setIsLoading(true);
      await paymentsAPI.delete(paymentMethodId);
      
      setState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          paymentMethods: prev.user.paymentMethods?.filter(pm => pm.id !== paymentMethodId) || [],
        } : null,
      }));
    } catch (err: any) {
      setError(err.message || 'Erro ao remover método de pagamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Definir método de pagamento padrão
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setIsLoading(true);
      await paymentsAPI.setDefault(paymentMethodId);
      
      setState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          paymentMethods: prev.user.paymentMethods?.map(pm => ({
            ...pm,
            isDefault: pm.id === paymentMethodId,
          })) || [],
        } : null,
      }));
    } catch (err: any) {
      setError(err.message || 'Erro ao definir método padrão');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
