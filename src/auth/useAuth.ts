// Hook useAuth pour une utilisation simplifiée de l'authentification
import { useAuth as useAuthContext } from './SanctumAuthProvider';
import { AuthContextType } from './types';

/**
 * Hook pour utiliser l'authentification Laravel Sanctum
 * Doit être utilisé à l'intérieur d'un SanctumAuthProvider
 */
export const useAuth = (): AuthContextType => {
  return useAuthContext();
};

export default useAuth;