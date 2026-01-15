---
sidebar_position: 5
---

# Forms

The `useLaravelForm` hook simplifies form handling by automatically mapping Laravel 422 validation errors to your input fields.

## Basic Usage

```tsx
import { useLaravelForm, LaravelForm } from 'next-laravel-bridge';

interface RegisterData {
  name: string;
  email: string;
}

function RegisterForm() {
  const { data, setData, submit, errors, processing } = useLaravelForm<RegisterData>({
    name: '',
    email: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit('post', '/api/register');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input 
          value={data.name} 
          onChange={e => setData('name', e.target.value)} 
        />
        {/* Automatic error display */}
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <label>Email</label>
        <input 
          value={data.email} 
          onChange={e => setData('email', e.target.value)} 
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <button disabled={processing}>Register</button>
    </form>
  );
}
```

## Features

*   **Automatic Error Mapping**: Keys from Laravel's 422 JSON response (e.g., `errors.email`) are automatically mapped to `errors` state.
*   **Processing State**: `processing` boolean handles loading state for buttons.
*   **Reset**: `reset()` returns form to initial state.
*   **Set Data**: `setData` works for individual fields or the whole object.
