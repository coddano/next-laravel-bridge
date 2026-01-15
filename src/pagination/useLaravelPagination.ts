'use client';

import { useState, useCallback, useEffect } from 'react';
import { laravelApi } from '../api/LaravelApiClient';
import type { LaravelPaginatedResponse, UsePaginationOptions } from './types';

/**
 * State returned by useLaravelPagination
 */
export interface UseLaravelPaginationResult<T> {
    /** Current page data */
    data: T[];
    /** Current page */
    currentPage: number;
    /** Last page */
    lastPage: number;
    /** Total items */
    total: number;
    /** Items per page */
    perPage: number;
    /** Index of first item displayed */
    from: number | null;
    /** Index of last item displayed */
    to: number | null;
    /** Loading indicator */
    isLoading: boolean;
    /** Potential error */
    error: Error | null;
    /** Go to a specific page */
    goToPage: (page: number) => void;
    /** Go to next page */
    nextPage: () => void;
    /** Go to previous page */
    prevPage: () => void;
    /** Go to first page */
    firstPage: () => void;
    /** Go to last page */
    lastPageFn: () => void;
    /** Is there a next page? */
    hasNextPage: boolean;
    /** Is there a previous page? */
    hasPrevPage: boolean;
    /** Refresh data */
    refetch: () => Promise<void>;
    /** Change number of items per page */
    setPerPage: (perPage: number) => void;
}

/**
 * Hook for standard Laravel pagination (page-based)
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   currentPage,
 *   totalPages,
 *   goToPage,
 *   nextPage,
 *   prevPage,
 *   isLoading
 * } = useLaravelPagination<User>({
 *   endpoint: '/api/users',
 *   perPage: 15,
 * });
 * ```
 */
export function useLaravelPagination<T = unknown>(
    options: UsePaginationOptions
): UseLaravelPaginationResult<T> {
    const {
        endpoint,
        perPage: initialPerPage = 15,
        initialPage = 1,
        params = {},
        enabled = true,
    } = options;

    const [data, setData] = useState<T[]>([]);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(initialPerPage);
    const [from, setFrom] = useState<number | null>(null);
    const [to, setTo] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchPage = useCallback(async (page: number) => {
        if (!enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await laravelApi.get<LaravelPaginatedResponse<T>>(endpoint, {
                params: {
                    ...params,
                    page,
                    per_page: perPage,
                },
            });

            const paginatedData = response.data;
            setData(paginatedData.data);
            setCurrentPage(paginatedData.current_page);
            setLastPage(paginatedData.last_page);
            setTotal(paginatedData.total);
            setFrom(paginatedData.from);
            setTo(paginatedData.to);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Pagination failed');
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, params, perPage, enabled]);

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
        }
    }, [lastPage]);

    const nextPage = useCallback(() => {
        if (currentPage < lastPage) {
            setCurrentPage((prev) => prev + 1);
        }
    }, [currentPage, lastPage]);

    const prevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    }, [currentPage]);

    const firstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    const lastPageFn = useCallback(() => {
        setCurrentPage(lastPage);
    }, [lastPage]);

    const refetch = useCallback(async () => {
        await fetchPage(currentPage);
    }, [fetchPage, currentPage]);

    const handleSetPerPage = useCallback((newPerPage: number) => {
        setPerPage(newPerPage);
        setCurrentPage(1); // Reset to first page when changing perPage
    }, []);

    // Fetch when currentPage or perPage changes
    useEffect(() => {
        fetchPage(currentPage);
    }, [currentPage, perPage, fetchPage]);

    return {
        data,
        currentPage,
        lastPage,
        total,
        perPage,
        from,
        to,
        isLoading,
        error,
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPageFn,
        hasNextPage: currentPage < lastPage,
        hasPrevPage: currentPage > 1,
        refetch,
        setPerPage: handleSetPerPage,
    };
}
