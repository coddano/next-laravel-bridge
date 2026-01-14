'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { laravelApi } from '../api/LaravelApiClient';

/**
 * Options pour useLaravelQuery
 */
export interface UseLaravelQueryOptions<T> {
    /** Endpoint API à appeler */
    endpoint: string;
    /** Paramètres de requête */
    params?: Record<string, string | number | boolean | undefined>;
    /** Durée de cache en millisecondes (default: 5 min) */
    cacheTime?: number;
    /** Durée avant que les données soient considérées stale (default: 0) */
    staleTime?: number;
    /** Activer/désactiver la requête */
    enabled?: boolean;
    /** Callback en cas de succès */
    onSuccess?: (data: T) => void;
    /** Callback en cas d'erreur */
    onError?: (error: Error) => void;
    /** Refetch automatique sur focus window */
    refetchOnWindowFocus?: boolean;
    /** Intervalle de refetch automatique en ms (0 = désactivé) */
    refetchInterval?: number;
}

/**
 * État retourné par useLaravelQuery
 */
export interface UseLaravelQueryResult<T> {
    /** Données de la réponse */
    data: T | null;
    /** Indicateur de chargement initial */
    isLoading: boolean;
    /** Indicateur de refetch en cours */
    isFetching: boolean;
    /** Erreur éventuelle */
    error: Error | null;
    /** Fonction pour refetch manuellement */
    refetch: () => Promise<void>;
    /** Indicateur si les données sont stale */
    isStale: boolean;
    /** Timestamp du dernier fetch réussi */
    dataUpdatedAt: number | null;
}

// Cache global simple
const queryCache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Hook pour effectuer des requêtes GET vers une API Laravel avec cache
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

    // Générer une clé de cache unique
    const cacheKey = useRef('');
    cacheKey.current = `${endpoint}?${new URLSearchParams(
        Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    ).toString()}`;

    const isStale = dataUpdatedAt ? Date.now() - dataUpdatedAt > staleTime : true;

    const fetchData = useCallback(async (isRefetch = false) => {
        if (!enabled) return;

        // Vérifier le cache
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

            // Mettre en cache
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

    // Fetch initial
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
 * Fonction utilitaire pour invalider le cache
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
 * Fonction utilitaire pour vider tout le cache
 */
export function clearQueryCache(): void {
    queryCache.clear();
}
