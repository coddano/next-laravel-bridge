'use client';

import { useState, useCallback } from 'react';
import { laravelApi } from '../api/LaravelApiClient';
import { invalidateQuery } from './useLaravelQuery';

/**
 * HTTP method type for mutations
 */
export type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Options for useLaravelMutation
 */
export interface UseLaravelMutationOptions<TData, TVariables> {
    /** API endpoint */
    endpoint: string;
    /** HTTP method (default: POST) */
    method?: MutationMethod;
    /** Success callback */
    onSuccess?: (data: TData, variables: TVariables) => void;
    /** Error callback */
    onError?: (error: Error, variables: TVariables) => void;
    /** Callback always called (success or error) */
    onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
    /** Queries to invalidate upon success */
    invalidateQueries?: string[];
}

/**
 * State returned by useLaravelMutation
 */
export interface UseLaravelMutationResult<TData, TVariables> {
    /** Function to trigger mutation */
    mutate: (variables: TVariables) => Promise<TData | null>;
    /** Async version that awaits result */
    mutateAsync: (variables: TVariables) => Promise<TData>;
    /** Data from last successful mutation */
    data: TData | null;
    /** Mutation in progress indicator */
    isLoading: boolean;
    /** Potential error */
    error: Error | null;
    /** Reset state */
    reset: () => void;
    /** Did the mutation succeed? */
    isSuccess: boolean;
    /** Did the mutation fail? */
    isError: boolean;
}

/**
 * Hook to perform mutations (POST, PUT, PATCH, DELETE) to a Laravel API
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
 * // Usage
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

            // Invalidate specified queries
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
