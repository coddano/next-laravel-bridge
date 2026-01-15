---
sidebar_position: 9
---

# Notifications

A built-in Toast notification system.

## Setup

Ensure your app is wrapped in `<NotificationProvider>`.

## Usage

```tsx
import { useLaravelNotifications } from 'next-laravel-bridge';

function NotificationDemo() {
  const { 
    notify, 
    success, 
    error, 
    warning, 
    info 
  } = useLaravelNotifications();

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={() => success('Operation successful!', 'Great')}>
        Success
      </button>
      
      <button onClick={() => error('Something went wrong', 'Oops')}>
        Error
      </button>

      <button onClick={() => notify({
        type: 'info',
        title: 'Update Available',
        message: 'Click to reload',
        duration: 0, // Persistent
        action: {
          label: 'Reload',
          onClick: () => window.location.reload()
        }
      })}>
        Custom Action
      </button>
    </div>
  );
}
```
