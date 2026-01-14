/**
 * Utilitaires généraux pour les tests
 */

import { ReactElement } from 'react';

/**
 * Wrapper pour render avec tous les providers
 */
export interface RenderWithProvidersOptions {
    /** Utilisateur initial pour l'auth mock */
    initialUser?: {
        id: string | number;
        name: string;
        email: string;
        [key: string]: unknown;
    } | null;
    /** Props supplémentaires pour le wrapper */
    wrapperProps?: Record<string, unknown>;
}

/**
 * Attendre que les mises à jour async soient terminées
 */
export function waitForNextTick(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Attendre un délai spécifique
 */
export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attendre qu'une condition soit vraie
 */
export async function waitFor(
    condition: () => boolean,
    options: { timeout?: number; interval?: number } = {}
): Promise<void> {
    const { timeout = 5000, interval = 50 } = options;
    const startTime = Date.now();

    while (!condition()) {
        if (Date.now() - startTime > timeout) {
            throw new Error(`waitFor timeout after ${timeout}ms`);
        }
        await wait(interval);
    }
}

/**
 * Créer un mock de fetch
 */
export function createFetchMock() {
    const mockFetch = jest.fn();

    // Helper pour configurer les réponses
    const setupResponse = (url: string | RegExp, response: unknown, status = 200) => {
        mockFetch.mockImplementation(async (inputUrl: string) => {
            const matches = typeof url === 'string'
                ? inputUrl.includes(url)
                : url.test(inputUrl);

            if (matches) {
                return {
                    ok: status >= 200 && status < 300,
                    status,
                    json: async () => response,
                    text: async () => JSON.stringify(response),
                };
            }

            return {
                ok: false,
                status: 404,
                json: async () => ({ message: 'Not Found' }),
            };
        });
    };

    return {
        fetch: mockFetch,
        setupResponse,
        reset: () => mockFetch.mockReset(),
    };
}

/**
 * Spy sur console.error et console.warn
 */
export function spyConsole() {
    const originalError = console.error;
    const originalWarn = console.warn;
    const errors: unknown[][] = [];
    const warnings: unknown[][] = [];

    beforeEach(() => {
        console.error = (...args: unknown[]) => errors.push(args);
        console.warn = (...args: unknown[]) => warnings.push(args);
    });

    afterEach(() => {
        console.error = originalError;
        console.warn = originalWarn;
        errors.length = 0;
        warnings.length = 0;
    });

    return {
        getErrors: () => errors,
        getWarnings: () => warnings,
        hasError: (message: string) => errors.some((e) => String(e[0]).includes(message)),
        hasWarning: (message: string) => warnings.some((w) => String(w[0]).includes(message)),
    };
}

/**
 * Mock localStorage/sessionStorage
 */
export function createStorageMock() {
    const store: Record<string, string> = {};

    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            Object.keys(store).forEach((key) => delete store[key]);
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: jest.fn((index: number) => Object.keys(store)[index] || null),
        getStore: () => ({ ...store }),
    };
}
