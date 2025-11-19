import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthError, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: (options?: { 
    options?: {
      redirectTo?: string;
      queryParams?: {
        access_type?: string;
        prompt?: string;
      };
    };
  }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthError = (error: AuthError) => {
    console.error('Auth error:', error);
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('ایمیل یا رمز عبور اشتباه است.');
    } else if (error.message.includes('Email not confirmed')) {
      throw new Error('لطفاً ایمیل خود را تایید کنید.');
    } else if (error.message.includes('User already registered')) {
      throw new Error('این ایمیل قبلاً ثبت شده است.');
    } else {
      throw new Error('خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) handleAuthError(error);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) handleAuthError(error);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (options?: { 
    options?: {
      redirectTo?: string;
      queryParams?: {
        access_type?: string;
        prompt?: string;
      };
    };
  }) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: options?.options
      });
      if (error) handleAuthError(error);
      return { error };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};