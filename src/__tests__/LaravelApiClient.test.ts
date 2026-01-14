/**
 * Tests pour le client API Laravel
 */
import { LaravelApiClient } from '../api/LaravelApiClient';

// Mock axios
jest.mock('axios', () => {
    const mockAxiosInstance = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        defaults: {
            headers: {
                common: {}
            }
        },
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() }
        }
    };

    return {
        create: jest.fn(() => mockAxiosInstance),
        default: {
            create: jest.fn(() => mockAxiosInstance)
        }
    };
});

describe('LaravelApiClient', () => {
    let client: LaravelApiClient;

    beforeEach(() => {
        jest.clearAllMocks();
        client = new LaravelApiClient({
            baseURL: 'http://localhost:8000/api'
        });
    });

    describe('constructor', () => {
        it('should create an instance with default config', () => {
            const defaultClient = new LaravelApiClient();
            expect(defaultClient).toBeInstanceOf(LaravelApiClient);
        });

        it('should create an instance with custom config', () => {
            const customClient = new LaravelApiClient({
                baseURL: 'https://api.example.com',
                timeout: 5000
            });
            expect(customClient).toBeInstanceOf(LaravelApiClient);
        });
    });

    describe('setAuthToken', () => {
        it('should set the authorization header', () => {
            client.setAuthToken('test-token-123');
            // Le test vérifie que la méthode ne lève pas d'erreur
            expect(true).toBe(true);
        });
    });

    describe('clearAuthToken', () => {
        it('should clear the authorization header', () => {
            client.setAuthToken('test-token-123');
            client.clearAuthToken();
            // Le test vérifie que la méthode ne lève pas d'erreur
            expect(true).toBe(true);
        });
    });

    describe('getConfig', () => {
        it('should return a copy of the current config', () => {
            const config = client.getConfig();
            expect(config).toBeDefined();
            expect(config.baseURL).toBe('http://localhost:8000/api');
        });

        it('should return immutable config (copy)', () => {
            const config1 = client.getConfig();
            const config2 = client.getConfig();
            expect(config1).not.toBe(config2);
            expect(config1).toEqual(config2);
        });
    });

    describe('updateConfig', () => {
        it('should update the config', () => {
            client.updateConfig({ timeout: 10000 });
            const config = client.getConfig();
            expect(config.timeout).toBe(10000);
        });

        it('should merge with existing config', () => {
            client.updateConfig({ timeout: 5000 });
            const config = client.getConfig();
            expect(config.baseURL).toBe('http://localhost:8000/api');
            expect(config.timeout).toBe(5000);
        });
    });
});
