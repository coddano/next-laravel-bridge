'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, AuthState, LoginCredentials, RegisterData, User } from './types';
import { laravelApi } from '../api/LaravelApiClient';
import { setCookie, removeCookie, getCookie } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface SanctumAuthProviderProps {
  children: ReactNode;
}

export const SanctumAuthProvider: React.FC<SanctumAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Vérifier si l'utilisateur est déjà connecté au montage du composant
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const token = getCookie(STORAGE_KEYS.ACCESS_TOKEN);

      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Récupérer les informations de l'utilisateur
      const response = await laravelApi.get('/user');
      const user: User = response.data;

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token invalide ou expiré
      removeCookie(STORAGE_KEYS.ACCESS_TOKEN);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Demander un token CSRF si nécessaire
      await laravelApi.get('/sanctum/csrf-cookie');

      // Effectuer la connexion
      const response = await laravelApi.post('/login', credentials);

      const { user, token } = response.data;

      // Stocker le token
      setCookie(STORAGE_KEYS.ACCESS_TOKEN, token, { expires: 7 }); // 7 jours

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Demander un token CSRF si nécessaire
      await laravelApi.get('/sanctum/csrf-cookie');

      // Créer le compte utilisateur
      const response = await laravelApi.post('/register', data);

      const { user, token } = response.data;

      // Stocker le token
      setCookie(STORAGE_KEYS.ACCESS_TOKEN, token, { expires: 7 });

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Appeler l'API de déconnexion Laravel
      await laravelApi.post('/logout');

      // Supprimer le token côté client
      removeCookie(STORAGE_KEYS.ACCESS_TOKEN);

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      // Même en cas d'erreur, supprimer le token côté client
      removeCookie(STORAGE_KEYS.ACCESS_TOKEN);

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await laravelApi.get('/user');
      const user: User = response.data;

      setAuthState(prev => ({
        ...prev,
        user,
      }));
    } catch (error) {
      // Si la requête échoue, déconnecter l'utilisateur
      await logout();
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SanctumAuthProvider');
  }
  return context;
};