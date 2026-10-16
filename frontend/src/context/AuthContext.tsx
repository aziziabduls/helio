'use client';

import { UserProfile, fetchMe, loginUser, signupUser } from '@/lib/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'helio_auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const refreshUser = async () => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await fetchMe(storedToken);
      setUser(profile);
      setToken(storedToken);
    } catch (err) {
      console.error('Session expired or invalid:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password?: string) => {
    const result = await loginUser({ email, password });
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, result.token);
    }
    setToken(result.token);
    setUser(result.user);
    setIsAuthModalOpen(false);
  };

  const signup = async (name: string, email: string, password?: string) => {
    const result = await signupUser({ name, email, password });
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, result.token);
    }
    setToken(result.token);
    setUser(result.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
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
