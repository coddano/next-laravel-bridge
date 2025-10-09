// Configuration de l'API Laravel
export interface LaravelApiConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  headers?: Record<string, string>;
}

export const defaultConfig: LaravelApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
};