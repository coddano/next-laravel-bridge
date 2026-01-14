/**
 * Utilitaires pour mocker l'API Laravel dans les tests
 */

import type { AxiosResponse } from 'axios';

/**
 * Créer une réponse Axios mockée
 */
export function createMockResponse<T>(data: T, status = 200): AxiosResponse<T> {
    return {
        data,
        status,
        statusText: status === 200 ? 'OK' : 'Error',
        headers: {},
        config: {
            headers: {} as any,
        },
    };
}

/**
 * Créer une erreur de validation Laravel mockée
 */
export function createValidationError(
    errors: Record<string, string[]>,
    message = 'The given data was invalid.'
) {
    return {
        response: {
            status: 422,
            data: {
                message,
                errors,
            },
        },
        isAxiosError: true,
    };
}

/**
 * Créer une erreur d'authentification mockée
 */
export function createAuthError(message = 'Unauthenticated.') {
    return {
        response: {
            status: 401,
            data: {
                message,
            },
        },
        isAxiosError: true,
    };
}

/**
 * Créer une erreur 404 mockée
 */
export function createNotFoundError(message = 'Not Found') {
    return {
        response: {
            status: 404,
            data: {
                message,
            },
        },
        isAxiosError: true,
    };
}

/**
 * Créer une réponse paginée Laravel mockée
 */
export function createPaginatedResponse<T>(
    data: T[],
    page = 1,
    perPage = 15,
    total?: number
) {
    const actualTotal = total ?? data.length;
    const lastPage = Math.ceil(actualTotal / perPage);

    return createMockResponse({
        data,
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total: actualTotal,
        from: data.length > 0 ? (page - 1) * perPage + 1 : null,
        to: data.length > 0 ? (page - 1) * perPage + data.length : null,
        first_page_url: `?page=1`,
        last_page_url: `?page=${lastPage}`,
        next_page_url: page < lastPage ? `?page=${page + 1}` : null,
        prev_page_url: page > 1 ? `?page=${page - 1}` : null,
        path: '/api/resource',
        links: [],
    });
}

/**
 * Créer un mock du laravelApi
 */
export function createMockLaravelApi() {
    return {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        setAuthToken: jest.fn(),
        clearAuthToken: jest.fn(),
        getConfig: jest.fn(() => ({})),
        updateConfig: jest.fn(),
    };
}

/**
 * Delay helper pour simuler la latence réseau
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wrapper pour les tests async avec timeout
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs = 5000
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Test timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}
