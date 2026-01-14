'use client';

import React, { ReactNode, useState, useCallback } from 'react';

/**
 * Type utilisateur mock
 */
export interface MockUser {
    id: string | number;
    name: string;
    email: string;
    [key: string]: unknown;
}

/**
 * Contexte mock d'authentification
 */
interface MockAuthContextValue {
    user: MockUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: MockUser | null) => void;
}

const MockAuthContext = React.createContext<MockAuthContextValue | null>(null);

/**
 * Props du MockAuthProvider
 */
interface MockAuthProviderProps {
    children: ReactNode;
    /** Utilisateur initial (si connecté) */
    initialUser?: MockUser | null;
    /** Simuler un délai de chargement */
    simulateLoading?: boolean;
    /** Délai en ms */
    loadingDelay?: number;
}

/**
 * Provider d'authentification mock pour les tests
 * 
 * @example
 * ```tsx
 * // Dans vos tests
 * import { MockAuthProvider } from 'next-laravel-bridge/testing';
 * import { render } from '@testing-library/react';
 * 
 * const mockUser = {
 *   id: 1,
 *   name: 'Test User',
 *   email: 'test@example.com',
 * };
 * 
 * test('renders protected content when authenticated', () => {
 *   render(
 *     <MockAuthProvider initialUser={mockUser}>
 *       <ProtectedComponent />
 *     </MockAuthProvider>
 *   );
 *   
 *   expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
 * });
 * 
 * test('redirects when not authenticated', () => {
 *   render(
 *     <MockAuthProvider initialUser={null}>
 *       <ProtectedComponent />
 *     </MockAuthProvider>
 *   );
 *   
 *   expect(screen.getByText('Please login')).toBeInTheDocument();
 * });
 * ```
 */
export function MockAuthProvider({
    children,
    initialUser = null,
    simulateLoading = false,
    loadingDelay = 100,
}: MockAuthProviderProps) {
    const [user, setUser] = useState<MockUser | null>(initialUser);
    const [isLoading, setIsLoading] = useState(simulateLoading);

    // Simuler le chargement initial
    React.useEffect(() => {
        if (simulateLoading) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, loadingDelay);
            return () => clearTimeout(timer);
        }
    }, [simulateLoading, loadingDelay]);

    const login = useCallback(async (_credentials: { email: string; password: string }) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, loadingDelay));
        setUser({
            id: 1,
            name: 'Mock User',
            email: _credentials.email,
        });
        setIsLoading(false);
    }, [loadingDelay]);

    const logout = useCallback(async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, loadingDelay));
        setUser(null);
        setIsLoading(false);
    }, [loadingDelay]);

    const value: MockAuthContextValue = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
    };

    return (
        <MockAuthContext.Provider value={value}>
            {children}
        </MockAuthContext.Provider>
    );
}

/**
 * Hook pour accéder au contexte mock d'auth dans les tests
 */
export function useMockAuth(): MockAuthContextValue {
    const context = React.useContext(MockAuthContext);
    if (!context) {
        throw new Error('useMockAuth must be used within a MockAuthProvider');
    }
    return context;
}
