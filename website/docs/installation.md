---
sidebar_position: 2
---

# Installation

## Prerequisites

*   **Next.js** project (App Router or Pages Router)
*   **Laravel** API with Sanctum installed

## Install the package

```bash
npm install next-laravel-bridge
```

## Optional Dependencies

If you plan to use **Broadcasting** (WebSockets), install the following:

```bash
npm install laravel-echo pusher-js
```

## Setup Providers

Wrap your application with the necessary providers in `app/layout.tsx` (or `app/providers.tsx`):

```tsx title="app/providers.tsx"
'use client';

import { 
  SanctumAuthProvider, 
  NotificationProvider 
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
```

## Configure API Client

Create a configuration file to initialize the API client (e.g., `lib/api.ts`):

```typescript title="lib/api.ts"
import { LaravelApiClient } from 'next-laravel-bridge';

export const apiClient = new LaravelApiClient({
  baseURL: process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000',
  // You can add default headers here if needed
});
```
