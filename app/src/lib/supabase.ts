import { createClient } from '@supabase/supabase-js';
import type { User, Job, Candidate } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export const signUpWithEmail = async (email: string, password: string, name: string, companyName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        company_name: companyName,
      }
    }
  });
  
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    }
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database helpers
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data as User;
};

export const createUserProfile = async (userData: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
  
  if (error) throw error;
  return data as User;
};

export const fetchJobs = async (userId: string): Promise<Job[]> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
  
  return data as Job[];
};

export const createJob = async (jobData: Partial<Job>) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select()
    .single();
  
  if (error) throw error;
  return data as Job;
};

export const updateJob = async (jobId: string, updates: Partial<Job>) => {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Job;
};

export const deleteJob = async (jobId: string) => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId);
  
  if (error) throw error;
};

export const fetchCandidates = async (jobId: string): Promise<Candidate[]> => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
  
  return data as Candidate[];
};

export const createCandidate = async (candidateData: Partial<Candidate>) => {
  const { data, error } = await supabase
    .from('candidates')
    .insert(candidateData)
    .select()
    .single();
  
  if (error) throw error;
  return data as Candidate;
};

export const updateCandidate = async (candidateId: string, updates: Partial<Candidate>) => {
  const { data, error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', candidateId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Candidate;
};

export const deleteCandidate = async (candidateId: string) => {
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId);
  
  if (error) throw error;
};
