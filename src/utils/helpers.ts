// Utilitaires et fonctions helpers
import Cookies from 'js-cookie';

/**
 * Récupère un cookie en toute sécurité
 */
export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

/**
 * Définit un cookie en toute sécurité
 */
export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes): void => {
  Cookies.set(name, value, options);
};

/**
 * Supprime un cookie
 */
export const removeCookie = (name: string, options?: Cookies.CookieAttributes): void => {
  Cookies.remove(name, options);
};

/**
 * Vérifie si une valeur est vide
 */
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Formate les erreurs Laravel pour l'affichage
 */
export const formatLaravelErrors = (errors: Record<string, string[]>): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};

  Object.keys(errors).forEach(key => {
    formattedErrors[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
  });

  return formattedErrors;
};