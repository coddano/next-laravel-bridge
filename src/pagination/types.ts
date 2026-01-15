/**
 * Laravel pagination types
 */

/**
 * Standard Laravel pagination response (page-based)
 */
export interface LaravelPaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    links: PaginationLink[];
}

/**
 * Pagination link
 */
export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

/**
 * Laravel cursor pagination response
 */
export interface LaravelCursorPaginatedResponse<T> {
    data: T[];
    next_cursor: string | null;
    next_page_url: string | null;
    prev_cursor: string | null;
    prev_page_url: string | null;
    path: string;
    per_page: number;
}

/**
 * Options for useLaravelPagination
 */
export interface UsePaginationOptions {
    /** API Endpoint */
    endpoint: string;
    /** Items per page (default: 15) */
    perPage?: number;
    /** Initial page (default: 1) */
    initialPage?: number;
    /** Additional parameters */
    params?: Record<string, string | number | boolean | undefined>;
    /** Enable/disable request */
    enabled?: boolean;
}

/**
 * Options for useCursorPagination
 */
export interface UseCursorPaginationOptions {
    /** API Endpoint */
    endpoint: string;
    /** Items per page (default: 15) */
    perPage?: number;
    /** Additional parameters */
    params?: Record<string, string | number | boolean | undefined>;
    /** Enable/disable request */
    enabled?: boolean;
}
