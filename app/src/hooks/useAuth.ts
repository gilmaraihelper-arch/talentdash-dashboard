/**
 * useAuth — Authentication domain hook with Clerk integration
 * Handles: login, register, logout, googleLogin, updateUserProfile, changePlan
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
import type { AppState, PlanType, User } from '@/types';
import { supabase } from '@/lib/supabase';

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
  initialState: AppState,
) {
  const navigate = useNavigate();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp } = useSignUp();
  const { user: clerkUser, isSignedIn } = useUser();

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Se já está logado, vai pro dashboard direto
      if (isSignedIn) {
        navigate('/dashboard', { replace: true });
        return;
      }

      if (!signIn) throw new Error('Clerk não inicializado');

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        // Login sucesso - o useStore vai detectar via Clerk hooks
        navigate('/dashboard');
        return result.createdSessionId;
      } else {
        throw new Error('Login incompleto');
      }
    } catch (err: unknown) {
      const message = (err as Error).message || 'Erro ao fazer login';
      // Se já está logado, redireciona pro dashboard em vez de mostrar erro
      if (message.toLowerCase().includes('already signed in') || message.toLowerCase().includes('já está logado')) {
        navigate('/dashboard', { replace: true });
        return;
      }
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setError, setIsLoading, signIn]);

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

      if (!signUp) throw new Error('Clerk não inicializado');

      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        unsafeMetadata: {
          companyName: data.companyName,
          plan: data.plan || 'free',
        },
      });

      if (result.status === 'complete') {
        // Registro sucesso - o useStore vai detectar e criar perfil no Supabase
        navigate('/dashboard');
        return result.createdSessionId;
      } else {
        // Pode precisar de verificação de email
        throw new Error('Registro incompleto - verifique seu email');
      }
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
  }, [navigate, setError, setIsLoading, signUp]);

  const logout = useCallback(async () => {
    try {
      // Clerk logout via window.Clerk (global)
      await window.Clerk?.signOut();
      setState(initialState);
      navigate('/');
    } catch {
      setState(initialState);
      navigate('/');
    }
  }, [initialState, navigate, setState]);

  const googleLogin = useCallback(async (_accessToken?: string, _userInfo?: unknown) => {
    // Google OAuth é gerenciado pelo SignInButton do Clerk
    // Esta função é mantida para compatibilidade mas não faz nada
    return Promise.resolve();
  }, []);

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