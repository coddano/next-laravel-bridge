/**
 * next-laravel-bridge
 * 
 * Complete NPM package for Next.js + Laravel integration
 * 
 * @packageDocumentation
 */

// ============================================
// Auth - Laravel Sanctum Authentication
// ============================================
export * from './auth';

// ============================================
// API - HTTP Client for Laravel
// ============================================
export * from './api';

// ============================================
// Forms - Laravel Form Management
// ============================================
export * from './forms';

// ============================================
// Query - React Query Style Requests
// ============================================
export * from './query';

// ============================================
// Pagination - Laravel Pagination
// ============================================
export * from './pagination';

// ============================================
// Upload - File Upload
// ============================================
export * from './upload';

// ============================================
// Notifications - Toast System
// ============================================
export * from './notifications';

// ============================================
// Broadcasting - Laravel Echo / WebSockets
// ============================================
export * from './broadcasting';

// ============================================
// SSR - Server-Side Rendering
// ============================================
export * from './ssr';

// ============================================
// Utils - Utilities
// ============================================
export * from './utils';

// ============================================
// Additional Hooks
// ============================================
export { useLaravelErrors } from './hooks';

// ============================================
// Testing - Test Utilities (separate import recommended)
// ============================================
// Note: For tests, import from 'next-laravel-bridge/testing'
// export * from './testing'; // Uncomment if you want to include everything