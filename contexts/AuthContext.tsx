'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginPayload, RegisterPayload } from '@/types/frontend';
import * as authService from '@/lib/services/authService';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user: profile } = await authService.getMe();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('qb_token') : null;
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    // The login API returns the full profile directly
    setUser(response.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload);
    // Don't auto-login — email verification required
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
