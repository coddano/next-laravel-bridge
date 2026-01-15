---
sidebar_position: 6
---

# Data Fetching (Query)

Inspired by React Query (TanStack Query), these hooks provide powerful data fetching capabilities tailored for Laravel's API structure.

## `useLaravelQuery` (GET)

Use this for fetching data. It handles caching, loading states, and auto-refetching.

```tsx
import { useLaravelQuery } from 'next-laravel-bridge';

function UserList() {
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isStale 
  } = useLaravelQuery({
    endpoint: '/api/users',
    params: { page: 1, type: 'active' },
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    staleTime: 60 * 1000,     // Data is fresh for 1 minute
    refetchOnWindowFocus: true
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

## `useLaravelMutation` (POST, PUT, DELETE)

Use this for modifying data. It can automatically invalidate cached queries to keep data fresh.

```tsx
import { useLaravelMutation } from 'next-laravel-bridge';

function CreateUser() {
  const { mutate, isLoading, error } = useLaravelMutation({
    endpoint: '/api/users',
    method: 'POST',
    // Invalidate the list so it updates automatically
    invalidateQueries: ['/api/users'], 
    onSuccess: (data) => {
      console.log('User created:', data);
    }
  });

  const handleCreate = () => {
    mutate({ name: 'John Doe', email: 'john@example.com' });
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      Create User
    </button>
  );
}
```
