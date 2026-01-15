---
sidebar_position: 4
---

# Access Control (ACL)

Manage user roles and permissions easily with the ACL system.

**Requirement:** Your User model API response must include `roles` and/or `permissions` arrays.

```json
// Example User Object from API
{
  "id": 1,
  "name": "John Doe",
  "roles": ["admin", "editor"],
  "permissions": ["edit-posts", "delete-users"]
}
```

## `useGate` Hook

The `useGate` hook provides programmatic access to checks.

```tsx
import { useGate } from 'next-laravel-bridge';

function AdminPanel() {
  const { can, cannot, hasRole, hasAnyRole } = useGate();

  const deleteUser = () => {
    if (cannot('delete-users')) {
      alert('You are not allowed to do this!');
      return;
    }
    // Proceed with delete...
  };

  return (
    <div>
      {hasRole('admin') && <span>Admin Badge</span>}
      
      {hasAnyRole(['editor', 'author']) && (
        <button>Edit Article</button>
      )}

      <button onClick={deleteUser}>Delete User</button>
    </div>
  );
}
```

## `<Can>` Component

Use the `<Can>` component for declarative rendering in your TSX.

```tsx
import { Can } from 'next-laravel-bridge';

function PostActions() {
  return (
    <div>
      {/* Show edit button only if user has 'edit-posts' permission */}
      <Can ability="edit-posts">
        <button>Edit Post</button>
      </Can>

      {/* Show message if permission is missing */}
      <Can ability="publish-posts" else={<p>Waiting for approval</p>}>
        <button>Publish Now</button>
      </Can>
    </div>
  );
}
```

## Super Admin

You can configure a "Super Admin" role that bypasses all checks.

```tsx
// When using the hook directly (options support coming to provider in next version)
const { can } = useGate({ superAdminRole: 'super-admin' });
```
