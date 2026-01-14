// Module Testing - Utilitaires pour les tests
export { MockAuthProvider, useMockAuth } from './MockAuthProvider';
export type { MockUser } from './MockAuthProvider';

export {
    createMockResponse,
    createValidationError,
    createAuthError,
    createNotFoundError,
    createPaginatedResponse,
    createMockLaravelApi,
    delay,
    withTimeout,
} from './mockLaravelApi';

export {
    waitForNextTick,
    wait,
    waitFor,
    createFetchMock,
    spyConsole,
    createStorageMock,
} from './testUtils';
export type { RenderWithProvidersOptions } from './testUtils';
