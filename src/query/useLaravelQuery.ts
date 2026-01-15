'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { laravelApi } from '../api/LaravelApiClient';

/**
 * Options for useLaravelQuery
 */
export interface UseLaravelQueryOptions<T> {
    /** API endpoint to call */
    endpoint: string;
    /** Request parameters */
    params?: Record<string, string | number | boolean | undefined>;
    /** Cache duration in milliseconds (default: 5 min) */
    cacheTime?: number;
    /** Duration before data is considered stale (default: 0) */
    staleTime?: number;
    /** Enable/disable request */
    enabled?: boolean;
    /** Success callback */
    onSuccess?: (data: T) => void;
    /** Error callback */
    onError?: (error: Error) => void;
    /** Automatic refetch on window focus */
    refetchOnWindowFocus?: boolean;
    /** Automatic refetch interval in ms (0 = disabled) */
    refetchInterval?: number;
}

/**
 * State returned by useLaravelQuery
 */
export interface UseLaravelQueryResult<T> {
    /** Response data */
    data: T | null;
    /** Initial loading indicator */
    isLoading: boolean;
    /** Refetching indicator */
    isFetching: boolean;
    /** Potential error */
    error: Error | null;
    /** Function to manually refetch */
    refetch: () => Promise<void>;
    /** Stale data indicator */
    isStale: boolean;
    /** Timestamp of last successful fetch */
    dataUpdatedAt: number | null;
}

// Simple global cache
const queryCache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Hook to perform GET requests to a Laravel API with cache
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useLaravelQuery<User[]>({
 *   endpoint: '/api/users',
 *   params: { page: 1 },
 *   cacheTime: 5 * 60 * 1000,
 * });
 * ```
 */
export function useLaravelQuery<T = unknown>(
    options: UseLaravelQueryOptions<T>
): UseLaravelQueryResult<T> {
    const {
        endpoint,
        params = {},
        cacheTime = 5 * 60 * 1000, // 5 minutes
        staleTime = 0,
        enabled = true,
        onSuccess,
        onError,
        refetchOnWindowFocus = false,
        refetchInterval = 0,
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [dataUpdatedAt, setDataUpdatedAt] = useState<number | null>(null);

    // Generate unique cache key
    const cacheKey = useRef('');
    cacheKey.current = `${endpoint}?${new URLSearchParams(
        Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    ).toString()}`;

    const isStale = dataUpdatedAt ? Date.now() - dataUpdatedAt > staleTime : true;

    const fetchData = useCallback(async (isRefetch = false) => {
        if (!enabled) return;

        // Check cache
        const cached = queryCache.get(cacheKey.current);
        if (cached && Date.now() - cached.timestamp < cacheTime && !isRefetch) {
            setData(cached.data as T);
            setDataUpdatedAt(cached.timestamp);
            setIsLoading(false);
            return;
        }

        try {
            if (isRefetch) {
                setIsFetching(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const response = await laravelApi.get<T>(endpoint, { params });
            const responseData = response.data;

            // Cache data
            const now = Date.now();
            queryCache.set(cacheKey.current, { data: responseData, timestamp: now });

            setData(responseData);
            setDataUpdatedAt(now);
            onSuccess?.(responseData);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            onError?.(error);
        } finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    }, [endpoint, params, cacheTime, enabled, onSuccess, onError]);

    const refetch = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Refetch on window focus
    useEffect(() => {
        if (!refetchOnWindowFocus) return;

        const handleFocus = () => {
            if (isStale) {
                refetch();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [refetchOnWindowFocus, isStale, refetch]);

    // Refetch interval
    useEffect(() => {
        if (refetchInterval <= 0) return;

        const interval = setInterval(() => {
            refetch();
        }, refetchInterval);

        return () => clearInterval(interval);
    }, [refetchInterval, refetch]);

    return {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
        isStale,
        dataUpdatedAt,
    };
}

/**
 * Utility function to invalidate cache
 */
export function invalidateQuery(endpoint: string): void {
    const keysToDelete: string[] = [];
    queryCache.forEach((_, key) => {
        if (key.startsWith(endpoint)) {
            keysToDelete.push(key);
        }
    });
    keysToDelete.forEach((key) => queryCache.delete(key));
}

/**
 * Utility function to clear entire cache
 */
export function clearQueryCache(): void {
    queryCache.clear();
}
