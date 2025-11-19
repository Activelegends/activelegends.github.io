import { createContext, useContext, useEffect, useState } from 'react';
import { getUser, logout, loginWithGoogle, type User } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const currentUser = await getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Check for auth callback (after OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      console.error('Auth error:', error);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Poll for user changes (e.g., after OAuth redirect)
    const interval = setInterval(() => {
      if (!user && !loading) {
        loadUser();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const signInWithGoogle = async () => {
    try {
      await loginWithGoogle();
      // User will be redirected, so we don't need to update state here
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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