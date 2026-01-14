/**
 * next-laravel-bridge
 * 
 * Un package NPM complet pour l'intégration Next.js + Laravel
 * 
 * @packageDocumentation
 */

// ============================================
// Auth - Authentification Laravel Sanctum
// ============================================
export * from './auth';

// ============================================
// API - Client HTTP pour Laravel
// ============================================
export * from './api';

// ============================================
// Forms - Gestion des formulaires Laravel
// ============================================
export * from './forms';

// ============================================
// Query - Requêtes style React Query
// ============================================
export * from './query';

// ============================================
// Pagination - Pagination Laravel
// ============================================
export * from './pagination';

// ============================================
// Upload - Upload de fichiers
// ============================================
export * from './upload';

// ============================================
// Notifications - Système de toasts
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
// Utils - Utilitaires
// ============================================
export * from './utils';

// ============================================
// Hooks supplémentaires
// ============================================
export { useLaravelErrors } from './hooks';

// ============================================
// Testing - Utilitaires de test (import séparé recommandé)
// ============================================
// Note: Pour les tests, importer depuis 'next-laravel-bridge/testing'
// export * from './testing'; // Décommentez si vous voulez tout inclure