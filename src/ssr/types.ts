/**
 * Types pour le support SSR (Server-Side Rendering)
 */

/**
 * Contexte d'authentification côté serveur
 */
export interface ServerAuthContext {
    /** L'utilisateur est-il authentifié ? */
    isAuthenticated: boolean;
    /** Données de l'utilisateur */
    user: ServerUser | null;
    /** Token d'accès (si disponible) */
    token: string | null;
}

/**
 * Utilisateur côté serveur (données minimales)
 */
export interface ServerUser {
    id: string | number;
    name?: string;
    email?: string;
    [key: string]: unknown;
}

/**
 * Options pour getServerSideAuth
 */
export interface GetServerAuthOptions {
    /** URL de l'API Laravel */
    apiUrl: string;
    /** Endpoint pour récupérer l'utilisateur (default: '/api/user') */
    userEndpoint?: string;
    /** Nom du cookie contenant le token (default: 'access_token') */
    cookieName?: string;
    /** Headers supplémentaires */
    headers?: Record<string, string>;
}

/**
 * Props retournées pour les pages SSR
 */
export interface ServerAuthProps {
    auth: ServerAuthContext;
}
