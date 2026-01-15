// API Client for Laravel with automatic token and error management
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
    // Request interceptor to add authentication tokens
    this.client.interceptors.request.use(authInterceptor);

    // Response interceptor to handle responses
    this.client.interceptors.response.use(
      responseInterceptor,
      errorInterceptor
    );

    // Error interceptor to handle Laravel validation errors
    this.client.interceptors.response.use(
      undefined,
      validationErrorInterceptor
    );
  }

  /**
   * Configures the client with a new authentication token
   */
  public setAuthToken(token: string): void {
    if (this.client.defaults.headers) {
      this.client.defaults.headers.common = this.client.defaults.headers.common || {};
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Removes the authentication token
   */
  public clearAuthToken(): void {
    if (this.client.defaults.headers?.common) {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  /**
   * HTTP methods with generic typing and improved error handling
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
   * Custom error handling
   */
  private handleError(error: AxiosError): AxiosError {
    // Add additional error information if necessary
    if (error.response?.status === 422 && (error.response.data as any)?.errors) {
      console.warn('Laravel validation error:', error.response.data);
    } else if (error.response?.status === 401) {
      console.warn('Authentication error');
    } else if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return error;
  }

  /**
   * Gets the current configuration
   */
  public getConfig(): LaravelApiConfig {
    return { ...this.config };
  }

  /**
   * Updates the configuration
   */
  public updateConfig(newConfig: Partial<LaravelApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    Object.assign(this.client.defaults, this.config);
  }
}

// Default instance with automatic configuration
export const laravelApi = new LaravelApiClient();

// React Hook to use API client with authentication
export const useLaravelApi = () => {
  return {
    api: laravelApi,
    setAuthToken: laravelApi.setAuthToken.bind(laravelApi),
    clearAuthToken: laravelApi.clearAuthToken.bind(laravelApi),
    updateConfig: laravelApi.updateConfig.bind(laravelApi),
  };
};