---
sidebar_position: 8
---

# File Upload

Handles file uploads with progress tracking and validation.

## Single Upload

```tsx
import { useLaravelUpload } from 'next-laravel-bridge';

function AvatarUpload() {
  const { 
    upload, 
    progress, 
    isUploading, 
    error 
  } = useLaravelUpload({
    endpoint: '/api/user/avatar',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png'],
  });

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) upload(file);
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
      
      {isUploading && (
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      )}
      
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}
```

## Multi Upload

Upload multiple files in parallel.

```tsx
import { useMultiUpload } from 'next-laravel-bridge';

function GalleryUpload() {
  const { upload, uploads, globalProgress } = useMultiUpload({
    endpoint: '/api/gallery/upload',
  });

  return (
    <div>
      <input 
        type="file" 
        multiple 
        onChange={(e) => upload(Array.from(e.target.files))} 
      />

      <p>Total Progress: {globalProgress}%</p>

      <ul>
        {uploads.map((fileState, index) => (
          <li key={index}>
            {fileState.file.name} - {fileState.progress}% 
            {fileState.error && ` (Error: ${fileState.error})`}
          </li>
        ))}
      </ul>
    </div>
  );
}
```
