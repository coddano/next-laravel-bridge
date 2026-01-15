# Next.js Laravel Bridge

[![npm version](https://badge.fury.io/js/next-laravel-bridge.svg)](https://badge.fury.io/js/next-laravel-bridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://github.com/coddano/next-laravel-bridge)
[![Build Status](https://github.com/coddano/next-laravel-bridge/workflows/CI/badge.svg)](https://github.com/coddano/next-laravel-bridge/actions)

A complete NPM package that facilitates integration between Next.js and Laravel, providing ready-to-use solutions for authentication, form management, API requests, pagination, uploads and more.

## 🚀 Features

### 🔐 Laravel Sanctum Authentication
- React Provider for authentication state management
- `useAuth` hook for login/logout operations
- Next.js Middleware to protect routes
- `withAuth` and `withGuest` HOCs for pages
- SSR support with `getServerSideAuth`

### 🔍 Query (React Query style)
- `useLaravelQuery` - GET requests with automatic caching
- `useLaravelMutation` - POST/PUT/DELETE mutations
- Automatic cache invalidation
- Automatic refetch (window focus, interval)

### 📄 Laravel Pagination
- `useLaravelPagination` - Standard pagination
- `useCursorPagination` - Cursor pagination (infinite scroll)
- Complete navigation (next, prev, goTo)

### 📁 File Upload
- `useLaravelUpload` - Simple upload with progress
- `useMultiUpload` - Multiple parallel uploads
- Validation (size, MIME type)
- Upload cancellation

### 🔔 Toast Notifications
- `NotificationProvider` - Toast system
- `useLaravelNotifications` - Notification hook
- Helpers: `success()`, `error()`, `warning()`, `info()`
- Customizable positions and durations

### 📡 Broadcasting (Laravel Echo)
- `EchoProvider` - Laravel Echo Provider
- `useChannel` - Public channels
- `usePrivateChannel` - Private channels
- `usePresence` - Presence channels
- Pusher and Soketi support

### 📝 Form Management
- `useLaravelForm` - Hook for forms
- Automatic Laravel validation error mapping
- Support for complex validations

### 🧪 Test Utilities
- `MockAuthProvider` - Auth mock for tests
- Helpers to mock Laravel API
- Test utilities (wait, waitFor, etc.)

## 📦 Installation

```bash
npm install next-laravel-bridge
```

### Optional Dependencies

To use broadcasting (WebSockets):
```bash
npm install laravel-echo pusher-js
```

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

### 2. API Configuration

```typescript
import { LaravelApiClient } from 'next-laravel-bridge';

const apiClient = new LaravelApiClient({
  baseURL: process.env.NEXT_PUBLIC_LARAVEL_API_URL,
});
```

## 📖 Usage

### Authentication

```tsx
import { useAuth } from 'next-laravel-bridge';

function LoginForm() {
  const { login, isLoading, user, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ email, password });
  };

  if (user) {
    return <button onClick={logout}>Logout</button>;
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Page Protection

```tsx
// With HOC
import { withAuth } from 'next-laravel-bridge';

function DashboardPage() {
  return <div>Protected Dashboard</div>;
}

export default withAuth(DashboardPage, {
  redirectTo: '/login',
  requiredRoles: ['admin'],
});
```

```ts
// With Middleware (middleware.ts)
import { createAuthMiddleware } from 'next-laravel-bridge';

export default createAuthMiddleware({
  protectedRoutes: ['/dashboard', '/profile/*'],
  loginRoute: '/login',
  publicRoutes: ['/', '/about'],
});
```

### Requests with Cache

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
    onSuccess: () => alert('User created!'),
  });

  return (
    <div>
      {users?.map(user => <UserCard key={user.id} user={user} />)}
      <button onClick={() => createUser({ name: 'John' })}>
        Add
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
          Previous
        </button>
        <span>{currentPage} / {lastPage}</span>
        <button onClick={nextPage} disabled={currentPage === lastPage}>
          Next
        </button>
      </div>
    </div>
  );
}
```

### File Upload

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
      success('Data saved!', 'Success');
    } catch (e) {
      error('An error occurred', 'Error');
    }
  };

  // Advanced notification
  const handleAdvanced = () => {
    notify({
      type: 'info',
      title: 'New update',
      message: 'A new version is available',
      duration: 0, // Permanent
      action: {
        label: 'Update',
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
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <p>Users online: {members.length}</p>
    </div>
  );
}
```

## 🔧 Laravel Configuration

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

## 📁 Package Structure

```
src/
├── api/           # Laravel API Client
├── auth/          # Sanctum Authentication
├── forms/         # Form Management
├── query/         # React Query style requests
├── pagination/    # Laravel Pagination
├── upload/        # File Upload
├── notifications/ # Toast System
├── broadcasting/  # Laravel Echo / WebSockets
├── ssr/           # SSR Support
├── testing/       # Test Utilities
└── utils/         # Helpers and constants
```

## 🧪 Tests

```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```



## 📄 License

MIT © [Jourdan Totonde](https://github.com/coddano)
