import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { api, User as ApiUser } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert API user to frontend User type
const convertUser = (apiUser: ApiUser): User => ({
  id: apiUser._id,
  email: apiUser.email,
  name: apiUser.name,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return saved && token ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Fetch user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const apiUser = await api.getMe();
      const frontendUser = convertUser(apiUser);
      setUser(frontendUser);
      localStorage.setItem('user', JSON.stringify(frontendUser));
    } catch (error) {
      // Token might be invalid, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login({ email, password });
      localStorage.setItem('token', response.token);
      
      // Fetch user details
      const apiUser = await api.getMe();
      const frontendUser = convertUser(apiUser);
      setUser(frontendUser);
      localStorage.setItem('user', JSON.stringify(frontendUser));
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, phone?: string): Promise<boolean> => {
    try {
      await api.signup({ email, password, name, phone });
      
      // Auto-login after signup
      const response = await api.login({ email, password });
      localStorage.setItem('token', response.token);
      
      // Fetch user details
      const apiUser = await api.getMe();
      const frontendUser = convertUser(apiUser);
      setUser(frontendUser);
      localStorage.setItem('user', JSON.stringify(frontendUser));
      
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
