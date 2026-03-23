/**
 * useAuth — Authentication domain hook
 * Handles: login, register, logout, googleLogin, updateUserProfile, changePlan
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppState, PlanType, User } from '@/types';
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  createUserProfile,
  fetchUserProfile,
} from '@/lib/supabase';

type SetState = React.Dispatch<React.SetStateAction<AppState>>;
type SetLoading = React.Dispatch<React.SetStateAction<boolean>>;
type SetError = React.Dispatch<React.SetStateAction<string | null>>;

// snake_case → camelCase helper (local, typed)
function snakeToCamel<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return (obj as unknown[]).map(snakeToCamel) as unknown as T;
  return Object.keys(obj as object).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    (acc as Record<string, unknown>)[camelKey] = snakeToCamel((obj as Record<string, unknown>)[key]);
    return acc;
  }, {} as T);
}

// camelCase → snake_case helper (local, typed)
function camelToSnake<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return (obj as unknown[]).map(camelToSnake) as unknown as T;
  return Object.keys(obj as object).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
    (acc as Record<string, unknown>)[snakeKey] = camelToSnake((obj as Record<string, unknown>)[key]);
    return acc;
  }, {} as T);
}

export function useAuth(
  state: AppState,
  setState: SetState,
  setIsLoading: SetLoading,
  setError: SetError,
  loadJobs: (userId: string) => Promise<unknown>,
  initialState: AppState,
) {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { user } = await signInWithEmail(email, password);
      if (!user) throw new Error('Erro ao fazer login');

      const profile = await fetchUserProfile(user.id);
      if (!profile) throw new Error('Perfil não encontrado');

      const userWithCamel = snakeToCamel(profile);

      setState(prev => ({
        ...prev,
        user: userWithCamel,
        isAuthenticated: true,
        currentView: 'user-dashboard',
      }));

      await loadJobs(user.id);
      navigate('/dashboard');
      return userWithCamel;
    } catch (err: unknown) {
      const message = (err as Error).message || 'Erro ao fazer login';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadJobs, navigate, setError, setIsLoading, setState]);

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

      const { user } = await signUpWithEmail(data.email, data.password, data.name, data.companyName);
      if (!user) throw new Error('Erro ao criar conta');

      const userProfile = await createUserProfile({
        id: user.id,
        email: data.email,
        name: data.name,
        company_name: data.companyName || '',
      } as Partial<User>);

      const userWithCamel = snakeToCamel(userProfile);

      setState(prev => ({
        ...prev,
        user: userWithCamel,
        isAuthenticated: true,
        currentView: 'user-dashboard',
      }));

      // onAuthStateChange no useStore já vai detectar o SIGNED_IN e navegar para /dashboard
      // mas garantimos aqui também caso não dispare
      setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          navigate('/dashboard');
        }
      }, 1000);

      return userWithCamel;
    } catch (err: unknown) {
      const message = (err as Error).message || 'Erro ao criar conta';
      if (message.includes('already exists') || message.includes('já cadastrado')) {
        setError('E-mail já cadastrado');
      } else {
        setError(message);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setError, setIsLoading, setState]);

  const logout = useCallback(async () => {
    try {
      await signOut();
      setState(initialState);
      navigate('/');
    } catch {
      setState(initialState);
      navigate('/');
    }
  }, [initialState, navigate, setState]);

  const googleLogin = useCallback(async (_accessToken: string, _userInfo?: unknown) => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao fazer login com Google');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading]);

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
      setState(prev => ({ ...prev, user: userWithCamel }));
      return userWithCamel;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setState, state.user?.id]);

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
      setState(prev => ({ ...prev, user: userWithCamel }));
      return userWithCamel;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao mudar plano');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setState, state.user?.id]);

  return { login, register, logout, googleLogin, updateUserProfile, changePlan };
}
