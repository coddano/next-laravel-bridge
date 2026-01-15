'use client';

import { useState, useCallback, useEffect } from 'react';
import { laravelApi } from '../api/LaravelApiClient';
import type { LaravelCursorPaginatedResponse, UseCursorPaginationOptions } from './types';

/**
 * State returned by useCursorPagination
 */
export interface UseCursorPaginationResult<T> {
    /** Accumulated data (all loaded pages) */
    data: T[];
    /** Loading indicator */
    isLoading: boolean;
    /** Indicator for loading more data */
    isFetchingMore: boolean;
    /** Potential error */
    error: Error | null;
    /** Is there more data to load? */
    hasMore: boolean;
    /** Load more data */
    fetchMore: () => Promise<void>;
    /** Reset and reload */
    refetch: () => Promise<void>;
}

/**
 * Hook for Laravel cursor pagination (infinite scroll)
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
 * // In an IntersectionObserver or "Load More" button
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
