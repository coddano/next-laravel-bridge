/**
 * Utilitaires pour l'authentification SSR avec Next.js et Laravel
 * 
 * Ces fonctions permettent de vérifier l'authentification côté serveur
 * pour le rendu SSR (getServerSideProps) ou les Server Components.
 */

import type { GetServerAuthOptions, ServerAuthContext, ServerUser } from './types';

/**
 * Récupérer le contexte d'authentification côté serveur
 * 
 * @example
 * ```ts
 * // pages/dashboard.tsx (Pages Router)
 * import { getServerSideAuth } from 'next-laravel-bridge';
 * 
 * export async function getServerSideProps(context) {
 *   const auth = await getServerSideAuth(context.req.cookies, {
 *     apiUrl: process.env.LARAVEL_API_URL,
 *   });
 * 
 *   if (!auth.isAuthenticated) {
 *     return {
 *       redirect: {
 *         destination: '/login',
 *         permanent: false,
 *       },
 *     };
 *   }
 * 
 *   return {
 *     props: { auth },
 *   };
 * }
 * ```
 * 
 * @example
 * ```ts
 * // app/dashboard/page.tsx (App Router - Server Component)
 * import { cookies } from 'next/headers';
 * import { getServerSideAuth } from 'next-laravel-bridge';
 * 
 * export default async function DashboardPage() {
 *   const cookieStore = cookies();
 *   const auth = await getServerSideAuth(
 *     Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value])),
 *     { apiUrl: process.env.LARAVEL_API_URL }
 *   );
 * 
 *   if (!auth.isAuthenticated) {
 *     redirect('/login');
 *   }
 * 
 *   return <div>Welcome, {auth.user?.name}</div>;
 * }
 * ```
 */
export async function getServerSideAuth(
    cookies: Record<string, string | undefined>,
    options: GetServerAuthOptions
): Promise<ServerAuthContext> {
    const {
        apiUrl,
        userEndpoint = '/api/user',
        cookieName = 'access_token',
        headers = {},
    } = options;

    const token = cookies[cookieName];

    // Pas de token -> non authentifié
    if (!token) {
        return {
            isAuthenticated: false,
            user: null,
            token: null,
        };
    }

    try {
        // Appeler l'API Laravel pour vérifier le token et récupérer l'utilisateur
        const response = await fetch(`${apiUrl}${userEndpoint}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...headers,
            },
            cache: 'no-store', // Toujours récupérer les données fraîches
        });

        if (!response.ok) {
            // Token invalide ou expiré
            return {
                isAuthenticated: false,
                user: null,
                token: null,
            };
        }

        const user: ServerUser = await response.json();

        return {
            isAuthenticated: true,
            user,
            token,
        };
    } catch (error) {
        // Erreur réseau ou autre
        console.error('SSR Auth Error:', error);
        return {
            isAuthenticated: false,
            user: null,
            token: null,
        };
    }
}

/**
 * Helper pour créer un handler getServerSideProps avec authentification requise
 * 
 * @example
 * ```ts
 * // pages/profile.tsx
 * import { withServerAuth } from 'next-laravel-bridge';
 * 
 * export const getServerSideProps = withServerAuth({
 *   apiUrl: process.env.LARAVEL_API_URL,
 *   redirectTo: '/login',
 * });
 * 
 * // ou avec des props supplémentaires
 * export const getServerSideProps = withServerAuth(
 *   { apiUrl: process.env.LARAVEL_API_URL },
 *   async (context, auth) => {
 *     // Logique supplémentaire
 *     const posts = await fetchPosts(auth.token);
 *     return {
 *       props: { posts },
 *     };
 *   }
 * );
 * ```
 */
export interface WithServerAuthConfig extends GetServerAuthOptions {
    /** Route de redirection si non authentifié */
    redirectTo?: string;
}

export type GetServerSidePropsContext = {
    req: { cookies: Record<string, string | undefined> };
    res: unknown;
    params?: Record<string, string | string[]>;
    query: Record<string, string | string[]>;
    resolvedUrl: string;
};

export type GetServerSidePropsResult<P> = {
    props?: P;
    redirect?: { destination: string; permanent: boolean };
    notFound?: boolean;
};

export function withServerAuth<P extends Record<string, unknown> = Record<string, unknown>>(
    config: WithServerAuthConfig,
    handler?: (
        context: GetServerSidePropsContext,
        auth: ServerAuthContext
    ) => Promise<GetServerSidePropsResult<P>>
) {
    return async function getServerSideProps(
        context: GetServerSidePropsContext
    ): Promise<GetServerSidePropsResult<P & { auth: ServerAuthContext }>> {
        const auth = await getServerSideAuth(context.req.cookies, config);

        if (!auth.isAuthenticated && config.redirectTo) {
            return {
                redirect: {
                    destination: config.redirectTo,
                    permanent: false,
                },
            };
        }

        if (handler) {
            const result = await handler(context, auth);

            if (result.redirect || result.notFound) {
                return result as GetServerSidePropsResult<P & { auth: ServerAuthContext }>;
            }

            return {
                props: {
                    ...result.props,
                    auth,
                } as P & { auth: ServerAuthContext },
            };
        }

        return {
            props: { auth } as P & { auth: ServerAuthContext },
        };
    };
}
