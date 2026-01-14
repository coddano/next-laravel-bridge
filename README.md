# Next.js Laravel Bridge

[![npm version](https://badge.fury.io/js/next-laravel-bridge.svg)](https://badge.fury.io/js/next-laravel-bridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://github.com/coddano/next-laravel-bridge)
[![Build Status](https://github.com/coddano/next-laravel-bridge/workflows/CI/badge.svg)](https://github.com/coddano/next-laravel-bridge/actions)

Un package NPM complet qui facilite l'intégration entre Next.js et Laravel, offrant des solutions prêtes à l'emploi pour l'authentification, la gestion des formulaires, les requêtes API, la pagination, les uploads et plus encore.

## 🚀 Fonctionnalités

### 🔐 Authentification Laravel Sanctum
- Provider React pour la gestion de l'état d'authentification
- Hook `useAuth` pour les opérations de connexion/déconnexion
- Middleware Next.js pour protéger les routes
- HOC `withAuth` et `withGuest` pour les pages
- Support SSR avec `getServerSideAuth`

### 🔍 Query (style React Query)
- `useLaravelQuery` - Requêtes GET avec cache automatique
- `useLaravelMutation` - Mutations POST/PUT/DELETE
- Invalidation de cache automatique
- Refetch automatique (window focus, interval)

### 📄 Pagination Laravel
- `useLaravelPagination` - Pagination standard
- `useCursorPagination` - Pagination par curseur (infinite scroll)
- Navigation complète (next, prev, goTo)

### 📁 Upload de Fichiers
- `useLaravelUpload` - Upload simple avec progression
- `useMultiUpload` - Upload multiple en parallèle
- Validation (taille, type MIME)
- Annulation d'upload

### 🔔 Notifications Toast
- `NotificationProvider` - Système de toasts
- `useLaravelNotifications` - Hook pour notifier
- Helpers: `success()`, `error()`, `warning()`, `info()`
- Positions et durées personnalisables

### 📡 Broadcasting (Laravel Echo)
- `EchoProvider` - Provider pour Laravel Echo
- `useChannel` - Channels publics
- `usePrivateChannel` - Channels privés
- `usePresence` - Channels de présence
- Support Pusher et Soketi

### 📝 Gestion des Formulaires
- `useLaravelForm` - Hook pour les formulaires
- Mapping automatique des erreurs de validation Laravel
- Support pour les validations complexes

### 🧪 Utilitaires de Test
- `MockAuthProvider` - Auth mock pour les tests
- Helpers pour mocker l'API Laravel
- Utilitaires de test (wait, waitFor, etc.)

## 📦 Installation

```bash
npm install next-laravel-bridge
```

### Dépendances optionnelles

Pour utiliser le broadcasting (WebSockets):
```bash
npm install laravel-echo pusher-js
```

## 🔧 Configuration Rapide

### 1. Providers (App Router)

```tsx
// app/providers.tsx
'use client';

import {
  SanctumAuthProvider,
  NotificationProvider,
} from 'next-laravel-bridge';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SanctumAuthProvider>
      <NotificationProvider position="top-right">
        {children}
      </NotificationProvider>
    </SanctumAuthProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 2. Configuration de l'API

```typescript
import { LaravelApiClient } from 'next-laravel-bridge';

const apiClient = new LaravelApiClient({
  baseURL: process.env.NEXT_PUBLIC_LARAVEL_API_URL,
});
```

## 📖 Utilisation

### Authentification

```tsx
import { useAuth } from 'next-laravel-bridge';

function LoginForm() {
  const { login, isLoading, user, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ email, password });
  };

  if (user) {
    return <button onClick={logout}>Déconnexion</button>;
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Protection des Pages

```tsx
// Avec HOC
import { withAuth } from 'next-laravel-bridge';

function DashboardPage() {
  return <div>Dashboard protégé</div>;
}

export default withAuth(DashboardPage, {
  redirectTo: '/login',
  requiredRoles: ['admin'],
});
```

```ts
// Avec Middleware (middleware.ts)
import { createAuthMiddleware } from 'next-laravel-bridge';

export default createAuthMiddleware({
  protectedRoutes: ['/dashboard', '/profile/*'],
  loginRoute: '/login',
  publicRoutes: ['/', '/about'],
});
```

### Requêtes avec Cache

```tsx
import { useLaravelQuery, useLaravelMutation } from 'next-laravel-bridge';

function UserList() {
  const { data: users, isLoading, refetch } = useLaravelQuery({
    endpoint: '/api/users',
    params: { page: 1 },
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  const { mutate: createUser } = useLaravelMutation({
    endpoint: '/api/users',
    method: 'POST',
    invalidateQueries: ['/api/users'],
    onSuccess: () => alert('Utilisateur créé !'),
  });

  return (
    <div>
      {users?.map(user => <UserCard key={user.id} user={user} />)}
      <button onClick={() => createUser({ name: 'John' })}>
        Ajouter
      </button>
    </div>
  );
}
```

### Pagination

```tsx
import { useLaravelPagination } from 'next-laravel-bridge';

function PostList() {
  const {
    data: posts,
    currentPage,
    lastPage,
    nextPage,
    prevPage,
    goToPage,
    isLoading
  } = useLaravelPagination({
    endpoint: '/api/posts',
    perPage: 10,
  });

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      
      <div>
        <button onClick={prevPage} disabled={currentPage === 1}>
          Précédent
        </button>
        <span>{currentPage} / {lastPage}</span>
        <button onClick={nextPage} disabled={currentPage === lastPage}>
          Suivant
        </button>
      </div>
    </div>
  );
}
```

### Upload de Fichiers

```tsx
import { useLaravelUpload } from 'next-laravel-bridge';

function FileUploader() {
  const { upload, progress, isUploading, error, result } = useLaravelUpload({
    endpoint: '/api/files',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf'],
    onSuccess: (response) => console.log('Uploaded:', response.url),
  });

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} 
      />
      {isUploading && <progress value={progress} max="100" />}
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}
```

### Notifications

```tsx
import { useLaravelNotifications } from 'next-laravel-bridge';

function MyComponent() {
  const { success, error, notify } = useLaravelNotifications();

  const handleSave = async () => {
    try {
      await saveData();
      success('Données enregistrées !', 'Succès');
    } catch (e) {
      error('Une erreur est survenue', 'Erreur');
    }
  };

  // Notification avancée
  const handleAdvanced = () => {
    notify({
      type: 'info',
      title: 'Nouvelle mise à jour',
      message: 'Une nouvelle version est disponible',
      duration: 0, // Permanent
      action: {
        label: 'Mettre à jour',
        onClick: () => updateApp(),
      },
    });
  };
}
```

### Broadcasting (WebSockets)

```tsx
import { EchoProvider, useChannel, usePresence } from 'next-laravel-bridge';

// Provider
function App() {
  return (
    <EchoProvider
      config={{
        driver: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_KEY,
        cluster: 'eu',
        authEndpoint: '/api/broadcasting/auth',
      }}
    >
      <ChatRoom />
    </EchoProvider>
  );
}

// Component
function ChatRoom() {
  const { events, isConnected } = useChannel('chat-room', {
    'message.new': (message) => console.log('New:', message),
  });

  const { members } = usePresence('room.1');

  return (
    <div>
      <p>Status: {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}</p>
      <p>Utilisateurs en ligne: {members.length}</p>
    </div>
  );
}
```

## 🔧 Configuration Laravel

```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'api' => [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // ...
    ],
];

// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
'supports_credentials' => true,
```

## 📁 Structure du Package

```
src/
├── api/           # Client API Laravel
├── auth/          # Authentification Sanctum
├── forms/         # Gestion des formulaires
├── query/         # Requêtes style React Query
├── pagination/    # Pagination Laravel
├── upload/        # Upload de fichiers
├── notifications/ # Système de toasts
├── broadcasting/  # Laravel Echo / WebSockets
├── ssr/           # Support SSR
├── testing/       # Utilitaires de test
└── utils/         # Helpers et constantes
```

## 🧪 Tests

```bash
npm run test          # Lancer les tests
npm run test:watch    # Mode watch
npm run test:coverage # Avec coverage
```

## 📚 Documentation

Voir le [ROADMAP.md](./ROADMAP.md) pour les fonctionnalités planifiées.

## 📄 Licence

MIT © [Jourdan Totonde](https://github.com/coddano)
