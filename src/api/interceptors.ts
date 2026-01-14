// Intercepteurs pour le client API Laravel
import axios, { AxiosResponse, AxiosError } from 'axios';
import { getCookie, setCookie, removeCookie } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Intercepteur de requête pour ajouter automatiquement les tokens d'authentification
 */
export const authInterceptor = (config: any) => {
  const token = getCookie(STORAGE_KEYS.ACCESS_TOKEN);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

/**
 * Intercepteur de réponse pour gérer les erreurs d'authentification
 */
export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

/**
 * Intercepteur d'erreur pour gérer les erreurs 401 et renouveler les tokens
 */
export const errorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config;

  // Si l'erreur est 401 (Unauthorized) et que ce n'est pas une demande de renouvellement
  if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
    (originalRequest as any)._retry = true;

    try {
      // Tenter de renouveler le token avec l'endpoint de refresh
      const refreshResponse = await fetch('/api/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();

        // Stocker le nouveau token
        if (data.token) {
          setCookie(STORAGE_KEYS.ACCESS_TOKEN, data.token, { expires: 7 });

          // Réessayer la requête originale avec le nouveau token
          if (originalRequest && originalRequest.url) {
            originalRequest.headers = originalRequest.headers ?? {} as typeof originalRequest.headers;
            (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${data.token}`;

            // Utiliser axios au lieu de fetch pour maintenir la cohérence
            return axios(originalRequest);
          }
        }
      }

      // Si le refresh échoue, déconnecter l'utilisateur
      removeCookie(STORAGE_KEYS.ACCESS_TOKEN);

      // Rediriger vers la page de connexion
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

    } catch (refreshError) {
      // Erreur lors du refresh, déconnecter l'utilisateur
      removeCookie(STORAGE_KEYS.ACCESS_TOKEN);

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // Pour les autres erreurs, les retourner telles quelles
  return Promise.reject(error);
};

/**
 * Intercepteur pour gérer les erreurs de validation Laravel (422)
 */
export const validationErrorInterceptor = (error: AxiosError) => {
  if (error.response?.status === 422) {
    const laravelError = {
      ...error,
      laravelErrors: (error.response.data as any)?.errors,
      message: (error.response.data as any)?.message || 'Erreur de validation',
    };
    return Promise.reject(laravelError);
  }

  return Promise.reject(error);
};