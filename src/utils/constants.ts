// Constantes utilisées dans le package
export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  USER: '/user',
  REFRESH: '/refresh',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'laravel_access_token',
  REFRESH_TOKEN: 'laravel_refresh_token',
  USER: 'laravel_user',
} as const;

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;