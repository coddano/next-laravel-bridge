/**
 * Types pour la pagination Laravel
 */

/**
 * Réponse de pagination Laravel standard (page-based)
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
 * Lien de pagination
 */
export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

/**
 * Réponse de pagination par curseur Laravel
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
 * Options pour useLaravelPagination
 */
export interface UsePaginationOptions {
    /** Endpoint API */
    endpoint: string;
    /** Nombre d'items par page (default: 15) */
    perPage?: number;
    /** Page initiale (default: 1) */
    initialPage?: number;
    /** Paramètres supplémentaires */
    params?: Record<string, string | number | boolean | undefined>;
    /** Activer/désactiver la requête */
    enabled?: boolean;
}

/**
 * Options pour useCursorPagination
 */
export interface UseCursorPaginationOptions {
    /** Endpoint API */
    endpoint: string;
    /** Nombre d'items par page (default: 15) */
    perPage?: number;
    /** Paramètres supplémentaires */
    params?: Record<string, string | number | boolean | undefined>;
    /** Activer/désactiver la requête */
    enabled?: boolean;
}
