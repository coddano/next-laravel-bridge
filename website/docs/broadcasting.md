---
sidebar_position: 10
---

# Broadcasting

Real-time capabilities using Laravel Echo (works with Pusher, Soketi, Reverb).

## Configuration

Wrap your app with `EchoProvider`.

```tsx
<EchoProvider
  config={{
    driver: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    forceTLS: true,
    authEndpoint: '/api/broadcasting/auth'
  }}
>
  {children}
</EchoProvider>
```

## Listening to Events

### Public Channel

```tsx
import { useChannel } from 'next-laravel-bridge';

function NewsTicker() {
  const { events } = useChannel('news', {
    'ArticlePublished': (e) => console.log('New article:', e.title)
  });
  
  return <div>Listening for news...</div>;
}
```

### Private Channel

Requires authentication.

```tsx
import { usePrivateChannel } from 'next-laravel-bridge';

function UserNotifications({ userId }) {
  usePrivateChannel(`App.Models.User.${userId}`, {
    'NotificationCreated': (e) => alert('New notification!')
  });
}
```

### Presence Channel

Track who is online.

```tsx
import { usePresence } from 'next-laravel-bridge';

function ChatRoom({ roomId }) {
  const { 
    members, // List of users
    joining, // Last user joined
    leaving  // Last user left
  } = usePresence(`chat.${roomId}`);

  return (
    <div>
      <h3>Online Users: {members.length}</h3>
      <ul>
        {members.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  );
}
```
