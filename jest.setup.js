// Jest setup file
require('@testing-library/jest-dom');

// Mock global fetch if needed
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
    writable: true
});

// Silence console errors/warnings in tests unless needed
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
                args[0].includes('Not implemented: navigation'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };

    console.warn = (...args) => {
        // Silence specific warnings during tests
        if (typeof args[0] === 'string' && args[0].includes('Erreur')) {
            return;
        }
        originalWarn.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
});
