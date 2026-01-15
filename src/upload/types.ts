/**
 * File upload types
 */

/**
 * Options for useLaravelUpload
 */
export interface UseLaravelUploadOptions {
    /** Upload endpoint */
    endpoint: string;
    /** Max size in bytes (default: 10MB) */
    maxSize?: number;
    /** Allowed MIME types */
    allowedTypes?: string[];
    /** File field name (default: 'file') */
    fieldName?: string;
    /** Progress callback */
    onProgress?: (percent: number) => void;
    /** Success callback */
    onSuccess?: (response: UploadResponse) => void;
    /** Error callback */
    onError?: (error: UploadError) => void;
    /** Additional headers */
    headers?: Record<string, string>;
}

/**
 * Standard upload response
 */
export interface UploadResponse {
    /** Uploaded file URL */
    url: string;
    /** File path */
    path: string;
    /** Original file name */
    originalName: string;
    /** Size in bytes */
    size: number;
    /** MIME Type */
    mimeType: string;
    /** Additional data */
    [key: string]: unknown;
}

/**
 * Upload error
 */
export interface UploadError {
    /** Error message */
    message: string;
    /** Error code */
    code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NETWORK_ERROR';
    /** Additional details */
    details?: unknown;
}

/**
 * State of an uploading file
 */
export interface UploadFileState {
    /** Unique ID */
    id: string;
    /** File */
    file: File;
    /** Progress (0-100) */
    progress: number;
    /** Status */
    status: 'pending' | 'uploading' | 'success' | 'error';
    /** Response on success */
    response?: UploadResponse;
    /** Error on failure */
    error?: UploadError;
}

/**
 * Options for useMultiUpload
 */
export interface UseMultiUploadOptions extends Omit<UseLaravelUploadOptions, 'onSuccess' | 'onError'> {
    /** Max concurrent uploads (default: 3) */
    maxConcurrent?: number;
    /** Callback when a file is uploaded */
    onFileSuccess?: (file: File, response: UploadResponse) => void;
    /** Callback when a file fails */
    onFileError?: (file: File, error: UploadError) => void;
    /** Callback when all files are processed */
    onAllComplete?: (results: UploadFileState[]) => void;
}
