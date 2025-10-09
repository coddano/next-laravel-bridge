// Utilitaires de validation pour les erreurs Laravel
export interface LaravelValidationErrors {
  [key: string]: string[];
}

export const formatValidationErrors = (errors: LaravelValidationErrors) => {
  // Formatage des erreurs Laravel
  return errors;
};