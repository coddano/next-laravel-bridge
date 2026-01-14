'use client';

import React, { ComponentType, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

/**
 * Options pour le HOC withAuth
 */
export interface WithAuthOptions {
    /** Route de redirection si non authentifié (default: '/login') */
    redirectTo?: string;
    /** Composant de chargement */
    LoadingComponent?: ComponentType;
    /** Rôles requis (optionnel) */
    requiredRoles?: string[];
    /** Permissions requises (optionnel) */
    requiredPermissions?: string[];
    /** Callback si non autorisé */
    onUnauthorized?: () => void;
}

/**
 * Composant de chargement par défaut
 */
function DefaultLoadingComponent() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontSize: 16,
                color: '#6b7280',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        border: '3px solid #e5e7eb',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }}
                />
                <span>Chargement...</span>
                <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        </div>
    );
}

/**
 * HOC pour protéger une page/composant avec authentification
 * 
 * @example
 * ```tsx
 * // pages/dashboard.tsx ou app/dashboard/page.tsx
 * import { withAuth } from 'next-laravel-bridge';
 * 
 * function DashboardPage() {
 *   return <div>Dashboard protégé</div>;
 * }
 * 
 * export default withAuth(DashboardPage, {
 *   redirectTo: '/login',
 *   requiredRoles: ['admin', 'user'],
 * });
 * ```
 */
export function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    options: WithAuthOptions = {}
): ComponentType<P> {
    const {
        redirectTo = '/login',
        LoadingComponent = DefaultLoadingComponent,
        requiredRoles = [],
        requiredPermissions = [],
        onUnauthorized,
    } = options;

    function AuthenticatedComponent(props: P) {
        const { user, isLoading, isAuthenticated } = useAuth();
        const [isAuthorized, setIsAuthorized] = useState(false);
        const [isChecking, setIsChecking] = useState(true);

        useEffect(() => {
            if (isLoading) return;

            // Pas authentifié -> redirection
            if (!isAuthenticated) {
                if (typeof window !== 'undefined') {
                    const currentPath = window.location.pathname;
                    window.location.href = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
                }
                return;
            }

            // Vérifier les rôles si spécifiés
            if (requiredRoles.length > 0 && user) {
                const userRoles = (user as { roles?: string[] }).roles || [];
                const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

                if (!hasRequiredRole) {
                    onUnauthorized?.();
                    setIsAuthorized(false);
                    setIsChecking(false);
                    return;
                }
            }

            // Vérifier les permissions si spécifiées
            if (requiredPermissions.length > 0 && user) {
                const userPermissions = (user as { permissions?: string[] }).permissions || [];
                const hasRequiredPermission = requiredPermissions.some((perm) =>
                    userPermissions.includes(perm)
                );

                if (!hasRequiredPermission) {
                    onUnauthorized?.();
                    setIsAuthorized(false);
                    setIsChecking(false);
                    return;
                }
            }

            setIsAuthorized(true);
            setIsChecking(false);
        }, [isLoading, isAuthenticated, user]);

        // Afficher le loader pendant la vérification
        if (isLoading || isChecking) {
            return <LoadingComponent />;
        }

        // Non autorisé
        if (!isAuthorized) {
            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        flexDirection: 'column',
                        gap: 16,
                    }}
                >
                    <div style={{ fontSize: 48 }}>🔒</div>
                    <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1f2937' }}>
                        Accès non autorisé
                    </h1>
                    <p style={{ color: '#6b7280' }}>
                        Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        Retour
                    </button>
                </div>
            );
        }

        // Autorisé -> afficher le composant
        return <WrappedComponent {...props} />;
    }

    // Préserver le nom du composant pour le debug
    AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
        })`;

    return AuthenticatedComponent;
}

/**
 * HOC pour les pages réservées aux invités (non authentifiés)
 * Redirige vers une page si l'utilisateur est déjà connecté
 * 
 * @example
 * ```tsx
 * import { withGuest } from 'next-laravel-bridge';
 * 
 * function LoginPage() {
 *   return <div>Page de connexion</div>;
 * }
 * 
 * export default withGuest(LoginPage, { redirectTo: '/dashboard' });
 * ```
 */
export function withGuest<P extends object>(
    WrappedComponent: ComponentType<P>,
    options: { redirectTo?: string; LoadingComponent?: ComponentType } = {}
): ComponentType<P> {
    const {
        redirectTo = '/dashboard',
        LoadingComponent = DefaultLoadingComponent,
    } = options;

    function GuestComponent(props: P) {
        const { isLoading, isAuthenticated } = useAuth();

        useEffect(() => {
            if (isLoading) return;

            if (isAuthenticated && typeof window !== 'undefined') {
                window.location.href = redirectTo;
            }
        }, [isLoading, isAuthenticated]);

        if (isLoading) {
            return <LoadingComponent />;
        }

        if (isAuthenticated) {
            return <LoadingComponent />;
        }

        return <WrappedComponent {...props} />;
    }

    GuestComponent.displayName = `withGuest(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
        })`;

    return GuestComponent;
}
