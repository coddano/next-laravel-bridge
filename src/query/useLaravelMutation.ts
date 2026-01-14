'use client';

import { useState, useCallback } from 'react';
import { laravelApi } from '../api/LaravelApiClient';
import { invalidateQuery } from './useLaravelQuery';

/**
 * Type de méthode HTTP pour les mutations
 */
export type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Options pour useLaravelMutation
 */
export interface UseLaravelMutationOptions<TData, TVariables> {
    /** Endpoint API */
    endpoint: string;
    /** Méthode HTTP (default: POST) */
    method?: MutationMethod;
    /** Callback en cas de succès */
    onSuccess?: (data: TData, variables: TVariables) => void;
    /** Callback en cas d'erreur */
    onError?: (error: Error, variables: TVariables) => void;
    /** Callback toujours appelé (succès ou erreur) */
    onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
    /** Queries à invalider après succès */
    invalidateQueries?: string[];
}

/**
 * État retourné par useLaravelMutation
 */
export interface UseLaravelMutationResult<TData, TVariables> {
    /** Fonction pour déclencher la mutation */
    mutate: (variables: TVariables) => Promise<TData | null>;
    /** Version async qui attend le résultat */
    mutateAsync: (variables: TVariables) => Promise<TData>;
    /** Données de la dernière mutation réussie */
    data: TData | null;
    /** Indicateur de mutation en cours */
    isLoading: boolean;
    /** Erreur éventuelle */
    error: Error | null;
    /** Réinitialiser l'état */
    reset: () => void;
    /** La mutation a-t-elle réussi ? */
    isSuccess: boolean;
    /** La mutation a-t-elle échoué ? */
    isError: boolean;
}

/**
 * Hook pour effectuer des mutations (POST, PUT, PATCH, DELETE) vers une API Laravel
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading } = useLaravelMutation<User, CreateUserInput>({
 *   endpoint: '/api/users',
 *   method: 'POST',
 *   onSuccess: (user) => {
 *     console.log('User created:', user);
 *   },
 *   invalidateQueries: ['/api/users'],
 * });
 * 
 * // Utilisation
 * mutate({ name: 'John', email: 'john@example.com' });
 * ```
 */
export function useLaravelMutation<TData = unknown, TVariables = unknown>(
    options: UseLaravelMutationOptions<TData, TVariables>
): UseLaravelMutationResult<TData, TVariables> {
    const {
        endpoint,
        method = 'POST',
        onSuccess,
        onError,
        onSettled,
        invalidateQueries = [],
    } = options;

    const [data, setData] = useState<TData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsSuccess(false);
        setIsError(false);
    }, []);

    const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        setIsError(false);

        try {
            let response;

            switch (method) {
                case 'POST':
                    response = await laravelApi.post<TData>(endpoint, variables);
                    break;
                case 'PUT':
                    response = await laravelApi.put<TData>(endpoint, variables);
                    break;
                case 'PATCH':
                    response = await laravelApi.patch<TData>(endpoint, variables);
                    break;
                case 'DELETE':
                    response = await laravelApi.delete<TData>(endpoint);
                    break;
            }

            const responseData = response.data;
            setData(responseData);
            setIsSuccess(true);

            // Invalider les queries spécifiées
            invalidateQueries.forEach((query) => invalidateQuery(query));

            onSuccess?.(responseData, variables);
            onSettled?.(responseData, null, variables);

            return responseData;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Mutation failed');
            setError(error);
            setIsError(true);

            onError?.(error, variables);
            onSettled?.(null, error, variables);

            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, method, onSuccess, onError, onSettled, invalidateQueries]);

    const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
        try {
            return await mutateAsync(variables);
        } catch {
            return null;
        }
    }, [mutateAsync]);

    return {
        mutate,
        mutateAsync,
        data,
        isLoading,
        error,
        reset,
        isSuccess,
        isError,
    };
}
