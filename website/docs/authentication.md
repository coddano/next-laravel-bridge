---
sidebar_position: 3
---

# Authentication

The package provides a complete solution for Laravel Sanctum authentication.

## usage

### Login & Logout

Use the `useAuth` hook to access authentication methods.

```tsx
import { useAuth } from 'next-laravel-bridge';

function LoginForm() {
  const { login, logout, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    await login({ email, password });
  };

  if (user) {
    return (
      <div>
        <p>Welcome, {user.name}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button disabled={isLoading}>Login</button>
    </form>
  );
}
```

## Protecting Routes

### Client-side Protection (HOC)

You can protect pages using the `withAuth` Higher-Order Component.

```tsx
'use client';

import { withAuth } from 'next-laravel-bridge';

function Dashboard() {
  return <h1>Private Dashboard</h1>;
}

// Redirects to /login if not authenticated
export default withAuth(Dashboard, {
  redirectTo: '/login',
});
```

### Server-side Middleware

For better performance and security, use the Next.js Middleware.

```ts title="middleware.ts"
import { createAuthMiddleware } from 'next-laravel-bridge';

export default createAuthMiddleware({
  protectedRoutes: ['/dashboard', '/profile/*'],
  publicRoutes: ['/', '/login', '/register'],
  loginRoute: '/login',
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```
