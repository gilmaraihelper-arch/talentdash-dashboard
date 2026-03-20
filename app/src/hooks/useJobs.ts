/**
 * useJobs — Jobs domain hook
 * Handles: createJob, updateJob, deleteJob, selectJob, loadJobs
 */
import { useCallback } from 'react';
import type {
  AppState,
  Job,
  PlanType,
  CustomField,
  JobTemplateType,
  DashboardModel,
  ColorTheme,
  Candidate,
} from '@/types';
import {
  fetchJobs,
  createJob as createJobDb,
  updateJob as updateJobDb,
  deleteJob as deleteJobDb,
  fetchCandidates,
} from '@/lib/supabase';

type SetState = React.Dispatch<React.SetStateAction<AppState>>;
type SetLoading = React.Dispatch<React.SetStateAction<boolean>>;
type SetError = React.Dispatch<React.SetStateAction<string | null>>;

function snakeToCamel<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return (obj as unknown[]).map(snakeToCamel) as unknown as T;
  return Object.keys(obj as object).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    (acc as Record<string, unknown>)[camelKey] = snakeToCamel((obj as Record<string, unknown>)[key]);
    return acc;
  }, {} as T);
}

function camelToSnake<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return (obj as unknown[]).map(camelToSnake) as unknown as T;
  return Object.keys(obj as object).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
    (acc as Record<string, unknown>)[snakeKey] = camelToSnake((obj as Record<string, unknown>)[key]);
    return acc;
  }, {} as T);
}

export function useJobs(
  state: AppState,
  setState: SetState,
  setIsLoading: SetLoading,
  setError: SetError,
) {
  const loadJobs = useCallback(async (userId?: string) => {
    try {
      const currentUserId = userId || state.user?.id;
      if (!currentUserId) return [];
      const jobs = await fetchJobs(currentUserId);
      const jobsWithCamel = snakeToCamel(jobs) as Job[];
      setState(prev => ({ ...prev, jobs: jobsWithCamel }));
      return jobsWithCamel;
    } catch (err) {
      console.error('Failed to load jobs:', err);
      return [];
    }
  }, [setState, state.user?.id]);

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
      if (!state.user?.id) throw new Error('Usuário não autenticado');
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
      const jobWithCamel = snakeToCamel(newJob) as Job;
      setState(prev => ({
        ...prev,
        jobs: [...prev.jobs, jobWithCamel],
        selectedJob: jobWithCamel,
      }));
      return jobWithCamel;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('createJob error:', errMsg);
      setError(errMsg || 'Erro ao criar mapeamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setState, state.user?.id]);

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    try {
      setIsLoading(true);
      const updatesWithSnake = camelToSnake(updates) as Partial<Job>;
      const updatedJob = await updateJobDb(jobId, updatesWithSnake);
      const jobWithCamel = snakeToCamel(updatedJob) as Job;
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === jobId ? jobWithCamel : j),
        selectedJob: prev.selectedJob?.id === jobId ? jobWithCamel : prev.selectedJob,
      }));
      return jobWithCamel;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao atualizar mapeamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setState]);

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
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao excluir mapeamento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setState]);

  const selectJob = useCallback(async (job: Job | null) => {
    setState(prev => ({ ...prev, selectedJob: job }));
    if (job) {
      try {
        const candidates = await fetchCandidates(job.id);
        const candidatesWithCamel = snakeToCamel(candidates) as Candidate[];
        setState(prev => ({ ...prev, candidates: candidatesWithCamel }));
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
    }
  }, [setState]);

  return { loadJobs, createJob, updateJob, deleteJob, selectJob };
}
