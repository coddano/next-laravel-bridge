# 🗺️ Next-Laravel-Bridge Roadmap

## Vision
Devenir LE package de référence pour connecter Next.js à Laravel, couvrant 100% des besoins d'intégration.

---

## 📊 Architecture Cible

```
next-laravel-bridge/
├── src/
│   ├── api/                    # Client API
│   │   ├── LaravelApiClient.ts
│   │   ├── ApiConfig.ts
│   │   ├── interceptors.ts
│   │   └── index.ts
│   │
│   ├── auth/                   # Authentification Sanctum
│   │   ├── SanctumAuthProvider.tsx
│   │   ├── useAuth.ts
│   │   ├── AuthMiddleware.ts   # 🆕 Middleware Next.js
│   │   ├── withAuth.tsx        # 🆕 HOC de protection
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── forms/                  # Gestion des formulaires
│   │   ├── useLaravelForm.ts
│   │   ├── LaravelForm.tsx
│   │   ├── validation.ts
│   │   └── index.ts
│   │
│   ├── query/                  # 🆕 React Query-like pour Laravel
│   │   ├── useLaravelQuery.ts
│   │   ├── useLaravelMutation.ts
│   │   ├── QueryProvider.tsx
│   │   ├── cache.ts
│   │   └── index.ts
│   │
│   ├── pagination/             # 🆕 Pagination Laravel
│   │   ├── useLaravelPagination.ts
│   │   ├── useCursorPagination.ts
│   │   ├── PaginationControls.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── upload/                 # 🆕 Upload de fichiers
│   │   ├── useLaravelUpload.ts
│   │   ├── useMultiUpload.ts
│   │   ├── UploadProgress.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── notifications/          # 🆕 Notifications toast
│   │   ├── useLaravelNotifications.ts
│   │   ├── NotificationProvider.tsx
│   │   ├── Toast.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── broadcasting/           # 🆕 Laravel Echo / WebSockets
│   │   ├── EchoProvider.tsx
│   │   ├── useChannel.ts
│   │   ├── usePresence.ts
│   │   ├── usePrivateChannel.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── ssr/                    # 🆕 Server-Side Rendering
│   │   ├── getServerSideAuth.ts
│   │   ├── withServerAuth.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── testing/                # 🆕 Utilitaires de test
│   │   ├── MockAuthProvider.tsx
│   │   ├── mockLaravelApi.ts
│   │   ├── testUtils.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   │
│   └── index.ts                # Point d'entrée principal
```

---

## 🚀 Phases d'Implémentation

### Phase 1: Amélioration du Core (Semaine 1)
**Objectif**: Solidifier les fondations existantes

- [ ] **1.1** Remplacer tous les `any` par des types stricts
- [ ] **1.2** Ajouter plus de tests (couvrir auth, forms)
- [ ] **1.3** Améliorer la gestion des erreurs
- [ ] **1.4** Ajouter retry logic avec backoff exponentiel
- [ ] **1.5** Documentation JSDoc complète

### Phase 2: Query & Pagination (Semaine 2)
**Objectif**: Faciliter les requêtes et la pagination

- [ ] **2.1** `useLaravelQuery` - Hook pour GET avec cache
- [ ] **2.2** `useLaravelMutation` - Hook pour POST/PUT/DELETE
- [ ] **2.3** `useLaravelPagination` - Pagination classique
- [ ] **2.4** `useCursorPagination` - Pagination par curseur
- [ ] **2.5** Composant `PaginationControls`

### Phase 3: Upload & Notifications (Semaine 3)
**Objectif**: UX avancée

- [ ] **3.1** `useLaravelUpload` - Upload avec progress
- [ ] **3.2** `useMultiUpload` - Upload multiple
- [ ] **3.3** `useLaravelNotifications` - Gestion des toasts
- [ ] **3.4** Composant `NotificationProvider`
- [ ] **3.5** Composant `Toast` personnalisable

### Phase 4: Auth Avancée & SSR (Semaine 4)
**Objectif**: Protection des routes et SSR

- [ ] **4.1** Middleware Next.js pour auth
- [ ] **4.2** HOC `withAuth` pour protéger les pages
- [ ] **4.3** `getServerSideAuth` pour SSR
- [ ] **4.4** Gestion des rôles et permissions
- [ ] **4.5** Support Session-based auth

### Phase 5: Broadcasting (Semaine 5)
**Objectif**: Temps réel avec Laravel Echo

- [ ] **5.1** `EchoProvider` - Provider pour Echo
- [ ] **5.2** `useChannel` - Écouter un channel public
- [ ] **5.3** `usePrivateChannel` - Channel privé
- [ ] **5.4** `usePresence` - Channel de présence
- [ ] **5.5** Support Pusher & Soketi

### Phase 6: Testing & Polish (Semaine 6)
**Objectif**: Qualité et documentation

- [ ] **6.1** Utilitaires de test (`MockAuthProvider`, etc.)
- [ ] **6.2** Tests E2E avec exemple d'app
- [ ] **6.3** Documentation complète avec Docusaurus
- [ ] **6.4** Exemples de projets
- [ ] **6.5** Badges et CI/CD complet

---

## 📖 Détails des Fonctionnalités

### 🔍 useLaravelQuery
```tsx
const { data, isLoading, error, refetch } = useLaravelQuery({
  endpoint: '/api/users',
  params: { page: 1, per_page: 10 },
  cacheTime: 5 * 60 * 1000, // 5 minutes
  staleTime: 1 * 60 * 1000, // 1 minute
  enabled: true,
});
```

### 📄 useLaravelPagination
```tsx
const {
  data,
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  prevPage,
  isLoading
} = useLaravelPagination({
  endpoint: '/api/posts',
  perPage: 15,
});
```

### 📁 useLaravelUpload
```tsx
const {
  upload,
  progress,
  isUploading,
  error,
  result
} = useLaravelUpload({
  endpoint: '/api/files',
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
  onProgress: (percent) => console.log(percent),
  onSuccess: (response) => console.log(response),
});
```

### 🔔 useLaravelNotifications
```tsx
const { notify, dismiss, notifications } = useLaravelNotifications();

notify({
  type: 'success',
  title: 'Succès',
  message: 'Opération réussie',
  duration: 5000,
});
```

### 🔒 Middleware Auth
```ts
// middleware.ts
import { createAuthMiddleware } from 'next-laravel-bridge';

export default createAuthMiddleware({
  protectedRoutes: ['/dashboard', '/profile'],
  loginRoute: '/login',
  publicRoutes: ['/', '/about'],
});
```

### 📡 Broadcasting
```tsx
const { messages } = useChannel('chat-room', {
  'message.new': (event) => {
    console.log('New message:', event);
  },
});

const { members, join, leave } = usePresence('room.1');
```

---

## 📦 Installation Finale

```bash
npm install next-laravel-bridge
```

```tsx
// app/providers.tsx
import {
  SanctumAuthProvider,
  NotificationProvider,
  QueryProvider,
  EchoProvider
} from 'next-laravel-bridge';

export function Providers({ children }) {
  return (
    <SanctumAuthProvider>
      <QueryProvider>
        <NotificationProvider>
          <EchoProvider>
            {children}
          </EchoProvider>
        </NotificationProvider>
      </QueryProvider>
    </SanctumAuthProvider>
  );
}
```

---

## 🎯 KPIs de Succès

| Métrique | Objectif |
|----------|----------|
| Tests | 100+ tests, >80% coverage |
| Stars GitHub | 100+ |
| Downloads NPM | 1000+/mois |
| Issues résolues | <24h response time |
| Documentation | 100% des APIs documentées |

---

## 🤝 Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.
