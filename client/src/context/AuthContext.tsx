import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { setAccessToken } from '../api/client';
import * as authApi from '../api/auth';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<{ pendingApproval: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to refresh token on mount
    authApi
      .refreshToken()
      .then((data) => {
        setAccessToken(data.accessToken);
        return authApi.getMe();
      })
      .then((u) => setUser(u))
      .catch(() => setAccessToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const data = await authApi.register(email, password, displayName);
    if (data.pendingApproval) {
      // No tokens returned — user must wait for root approval
      return { pendingApproval: true };
    }
    // Fallback if approval is ever disabled
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      setUser(data.user);
    }
    return { pendingApproval: false };
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
