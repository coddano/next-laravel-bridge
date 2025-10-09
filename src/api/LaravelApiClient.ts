// Client API pour Laravel avec gestion automatique des tokens et erreurs
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { LaravelApiConfig, defaultConfig } from './ApiConfig';
import {
  authInterceptor,
  responseInterceptor,
  errorInterceptor,
  validationErrorInterceptor
} from './interceptors';

export class LaravelApiClient {
  private client: AxiosInstance;
  private config: LaravelApiConfig;

  constructor(config: Partial<LaravelApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.client = axios.create(this.config);
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Intercepteur de requête pour ajouter les tokens d'authentification
    this.client.interceptors.request.use(authInterceptor);

    // Intercepteur de réponse pour traiter les réponses
    this.client.interceptors.response.use(
      responseInterceptor,
      errorInterceptor
    );

    // Intercepteur d'erreur pour gérer les erreurs de validation Laravel
    this.client.interceptors.response.use(
      undefined,
      validationErrorInterceptor
    );
  }

  /**
   * Configure le client avec un nouveau token d'authentification
   */
  public setAuthToken(token: string): void {
    if (this.client.defaults.headers) {
      this.client.defaults.headers.common = this.client.defaults.headers.common || {};
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Supprime le token d'authentification
   */
  public clearAuthToken(): void {
    if (this.client.defaults.headers?.common) {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Méthodes HTTP avec typage générique et gestion d'erreurs améliorée
   */
  public async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    try {
      return await this.client.get(url, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    try {
      return await this.client.post(url, data, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    try {
      return await this.client.put(url, data, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    try {
      return await this.client.patch(url, data, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    try {
      return await this.client.delete(url, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Gestion personnalisée des erreurs
   */
  private handleError(error: AxiosError): AxiosError {
    // Ajouter des informations supplémentaires sur l'erreur si nécessaire
    if (error.response?.status === 422 && (error.response.data as any)?.errors) {
      console.warn('Erreur de validation Laravel:', error.response.data);
    } else if (error.response?.status === 401) {
      console.warn('Erreur d\'authentification');
    } else if (error.response?.status && error.response.status >= 500) {
      console.error('Erreur serveur:', error.response.data);
    }

    return error;
  }

  /**
   * Récupère la configuration actuelle
   */
  public getConfig(): LaravelApiConfig {
    return { ...this.config };
  }

  /**
   * Met à jour la configuration
   */
  public updateConfig(newConfig: Partial<LaravelApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    Object.assign(this.client.defaults, this.config);
  }
}

// Instance par défaut avec configuration automatique
export const laravelApi = new LaravelApiClient();

// Hook React pour utiliser le client API avec l'authentification
export const useLaravelApi = () => {
  return {
    api: laravelApi,
    setAuthToken: laravelApi.setAuthToken.bind(laravelApi),
    clearAuthToken: laravelApi.clearAuthToken.bind(laravelApi),
    updateConfig: laravelApi.updateConfig.bind(laravelApi),
  };
};