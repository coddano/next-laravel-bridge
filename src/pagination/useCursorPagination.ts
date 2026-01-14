'use client';

import { useState, useCallback, useEffect } from 'react';
import { laravelApi } from '../api/LaravelApiClient';
import type { LaravelCursorPaginatedResponse, UseCursorPaginationOptions } from './types';

/**
 * État retourné par useCursorPagination
 */
export interface UseCursorPaginationResult<T> {
    /** Données accumulées (toutes les pages chargées) */
    data: T[];
    /** Indicateur de chargement */
    isLoading: boolean;
    /** Indicateur de chargement de plus de données */
    isFetchingMore: boolean;
    /** Erreur éventuelle */
    error: Error | null;
    /** Y a-t-il plus de données à charger ? */
    hasMore: boolean;
    /** Charger plus de données */
    fetchMore: () => Promise<void>;
    /** Réinitialiser et recharger */
    refetch: () => Promise<void>;
}

/**
 * Hook pour la pagination Laravel par curseur (infinite scroll)
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   hasMore,
 *   fetchMore,
 *   isLoading,
 *   isFetchingMore
 * } = useCursorPagination<Post>({
 *   endpoint: '/api/posts',
 *   perPage: 20,
 * });
 * 
 * // Dans un IntersectionObserver ou bouton "Load More"
 * if (hasMore) {
 *   fetchMore();
 * }
 * ```
 */
export function useCursorPagination<T = unknown>(
    options: UseCursorPaginationOptions
): UseCursorPaginationResult<T> {
    const {
        endpoint,
        perPage = 15,
        params = {},
        enabled = true,
    } = options;

    const [data, setData] = useState<T[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchData = useCallback(async (cursor?: string | null, isLoadMore = false) => {
        if (!enabled) return;

        if (isLoadMore) {
            setIsFetchingMore(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            const response = await laravelApi.get<LaravelCursorPaginatedResponse<T>>(endpoint, {
                params: {
                    ...params,
                    per_page: perPage,
                    ...(cursor ? { cursor } : {}),
                },
            });

            const paginatedData = response.data;

            if (isLoadMore) {
                setData((prev) => [...prev, ...paginatedData.data]);
            } else {
                setData(paginatedData.data);
            }

            setNextCursor(paginatedData.next_cursor);
            setHasMore(paginatedData.next_cursor !== null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Cursor pagination failed');
            setError(error);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [endpoint, params, perPage, enabled]);

    const fetchMore = useCallback(async () => {
        if (!hasMore || isFetchingMore || !nextCursor) return;
        await fetchData(nextCursor, true);
    }, [hasMore, isFetchingMore, nextCursor, fetchData]);

    const refetch = useCallback(async () => {
        setData([]);
        setNextCursor(null);
        setHasMore(true);
        await fetchData(null, false);
    }, [fetchData]);

    // Initial fetch
    useEffect(() => {
        fetchData(null, false);
    }, [fetchData]);

    return {
        data,
        isLoading,
        isFetchingMore,
        error,
        hasMore,
        fetchMore,
        refetch,
    };
}
