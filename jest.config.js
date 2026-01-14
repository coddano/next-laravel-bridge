/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // Définir où chercher les tests
  roots: ['<rootDir>/src'],
  
  // Patterns pour les fichiers de test
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  
  // Ignorer les dossiers
  testPathIgnorePatterns: [
    '/node_modules/',
    '/test-integration/',
    '/dist/'
  ],
  
  // Transformation TypeScript/JSX
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  
  // Extensions de module
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  
  // Module name mapper pour les chemins
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
