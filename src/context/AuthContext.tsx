import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../auth/tokenStorage';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
