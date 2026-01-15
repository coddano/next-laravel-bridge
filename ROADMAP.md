# 🗺️ Next-Laravel-Bridge Roadmap

## Vision
Become THE reference package for connecting Next.js to Laravel, covering 100% of integration needs.

---

## 📊 Target Architecture

```
next-laravel-bridge/
├── src/
│   │
│   ├── api/                    # API Client
│   │   ├── LaravelApiClient.ts
│   │   ├── ApiConfig.ts
│   │   ├── interceptors.ts
│   │   └── index.ts
│   │
│   ├── auth/                   # Sanctum Authentication
│   │   ├── SanctumAuthProvider.tsx
│   │   ├── useAuth.ts
│   │   ├── AuthMiddleware.ts   # 🆕 Next.js Middleware
│   │   ├── withAuth.tsx        # 🆕 Protection HOC
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── forms/                  # Form Management
│   │   ├── useLaravelForm.ts
│   │   ├── LaravelForm.tsx
│   │   ├── validation.ts
│   │   └── index.ts
│   │
│   ├── query/                  # 🆕 React Query-like for Laravel
│   │   ├── useLaravelQuery.ts
│   │   ├── useLaravelMutation.ts
│   │   ├── QueryProvider.tsx
│   │   ├── cache.ts
│   │   └── index.ts
│   │
│   ├── pagination/             # 🆕 Laravel Pagination
│   │   ├── useLaravelPagination.ts
│   │   ├── useCursorPagination.ts
│   │   ├── PaginationControls.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── upload/                 # 🆕 File Upload
│   │   ├── useLaravelUpload.ts
│   │   ├── useMultiUpload.ts
│   │   ├── UploadProgress.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── notifications/          # 🆕 Toast Notifications
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
│   ├── testing/                # 🆕 Test Utilities
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
│   └── index.ts                # Main Entry Point
```

---

## 🚀 Implementation Phases

### Phase 1: Core Improvement (Week 1)
**Goal**: Solidify existing foundations

- [ ] **1.1** Replace all `any` with strict types
- [ ] **1.2** Add more tests (cover auth, forms)
- [ ] **1.3** Improve error handling
- [ ] **1.4** Add retry logic with exponential backoff
- [ ] **1.5** Complete JSDoc documentation

### Phase 2: Query & Pagination (Week 2)
**Goal**: Facilitate requests and pagination

- [ ] **2.1** `useLaravelQuery` - Hook for GET with cache
- [ ] **2.2** `useLaravelMutation` - Hook for POST/PUT/DELETE
- [ ] **2.3** `useLaravelPagination` - Standard pagination
- [ ] **2.4** `useCursorPagination` - Cursor pagination
- [ ] **2.5** `PaginationControls` component

### Phase 3: Upload & Notifications (Week 3)
**Goal**: Advanced UX

- [ ] **3.1** `useLaravelUpload` - Upload with progress
- [ ] **3.2** `useMultiUpload` - Multiple upload
- [ ] **3.3** `useLaravelNotifications` - Toast management
- [ ] **3.4** `NotificationProvider` component
- [ ] **3.5** Customizable `Toast` component

### Phase 4: Advanced Auth & SSR (Week 4)
**Goal**: Route protection and SSR

- [ ] **4.1** Next.js Middleware for auth
- [ ] **4.2** `withAuth` HOC to protect pages
- [ ] **4.3** `getServerSideAuth` for SSR
- [ ] **4.4** Role and permission management
- [ ] **4.5** Session-based auth support

### Phase 5: Broadcasting (Week 5)
**Goal**: Real-time with Laravel Echo

- [ ] **5.1** `EchoProvider` - Provider for Echo
- [ ] **5.2** `useChannel` - Listen to public channel
- [ ] **5.3** `usePrivateChannel` - Private channel
- [ ] **5.4** `usePresence` - Presence channel
- [ ] **5.5** Pusher & Soketi support

### Phase 6: Testing & Polish (Week 6)
**Goal**: Quality and documentation

- [ ] **6.1** Test utilities (`MockAuthProvider`, etc.)
- [ ] **6.2** E2E tests with example app
- [ ] **6.3** Complete documentation with Docusaurus
- [ ] **6.4** Project examples
- [ ] **6.5** Badges and complete CI/CD

---

## 📖 Feature Details

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

## 📦 Final Installation

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

## 🎯 Success KPIs

| Metric | Goal |
|----------|----------|
| Tests | 100+ tests, >80% coverage |
| GitHub Stars | 100+ |
| NPM Downloads | 1000+/month |
| Resolved Issues | <24h response time |
| Documentation | 100% APIs documented |

---

## 🤝 Contribution

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
