/**
 * Configuration pour le middleware d'authentification Next.js
 * 
 * Ce fichier fournit une factory pour créer un middleware Next.js
 * qui protège les routes en vérifiant l'authentification.
 * 
 * @example
 * ```ts
 * // middleware.ts (à la racine du projet Next.js)
 * import { createAuthMiddleware } from 'next-laravel-bridge';
 * 
 * export default createAuthMiddleware({
 *   protectedRoutes: ['/dashboard', '/profile', '/settings'],
 *   loginRoute: '/login',
 *   publicRoutes: ['/', '/about', '/contact'],
 *   cookieName: 'laravel_token',
 * });
 * 
 * export const config = {
 *   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
 * };
 * ```
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Configuration du middleware d'authentification
 */
export interface AuthMiddlewareConfig {
    /** Routes qui nécessitent une authentification */
    protectedRoutes: string[];
    /** Route de connexion (redirect si non authentifié) */
    loginRoute: string;
    /** Routes accessibles sans authentification */
    publicRoutes?: string[];
    /** Nom du cookie contenant le token (default: 'access_token') */
    cookieName?: string;
    /** Route après connexion réussie (default: '/dashboard') */
    afterLoginRoute?: string;
    /** Callback personnalisé pour vérifier l'auth */
    customAuthCheck?: (request: NextRequest) => boolean | Promise<boolean>;
}

/**
 * Vérifier si une route correspond à un pattern
 */
function matchRoute(pathname: string, patterns: string[]): boolean {
    return patterns.some((pattern) => {
        // Pattern exact
        if (pattern === pathname) return true;

        // Pattern avec wildcard (ex: /admin/*)
        if (pattern.endsWith('/*')) {
            const base = pattern.slice(0, -2);
            return pathname.startsWith(base);
        }

        // Pattern avec paramètre dynamique (ex: /users/:id)
        if (pattern.includes(':')) {
            const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(pathname);
        }

        return false;
    });
}

/**
 * Créer un middleware Next.js pour l'authentification
 * 
 * @param config Configuration du middleware
 * @returns Middleware Next.js
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig) {
    const {
        protectedRoutes,
        loginRoute,
        publicRoutes = [],
        cookieName = 'access_token',
        afterLoginRoute = '/dashboard',
        customAuthCheck,
    } = config;

    return async function middleware(request: NextRequest) {
        const { pathname } = request.nextUrl;

        // Ignorer les fichiers statiques et API routes
        if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/api') ||
            pathname.includes('.')
        ) {
            return NextResponse.next();
        }

        // Vérifier si l'utilisateur est authentifié
        let isAuthenticated = false;

        if (customAuthCheck) {
            isAuthenticated = await customAuthCheck(request);
        } else {
            const token = request.cookies.get(cookieName)?.value;
            isAuthenticated = !!token;
        }

        const isProtectedRoute = matchRoute(pathname, protectedRoutes);
        const isPublicRoute = matchRoute(pathname, publicRoutes);
        const isLoginRoute = pathname === loginRoute;

        // Si l'utilisateur est authentifié et sur la page de login, rediriger
        if (isAuthenticated && isLoginRoute) {
            return NextResponse.redirect(new URL(afterLoginRoute, request.url));
        }

        // Si la route est protégée et l'utilisateur n'est pas authentifié
        if (isProtectedRoute && !isAuthenticated) {
            const loginUrl = new URL(loginRoute, request.url);
            // Sauvegarder l'URL de retour
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Continuer normalement
        return NextResponse.next();
    };
}

/**
 * Type pour l'export du middleware
 */
export type AuthMiddleware = ReturnType<typeof createAuthMiddleware>;
