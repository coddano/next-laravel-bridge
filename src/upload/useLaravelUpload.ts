'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { getCookie } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import type { UseLaravelUploadOptions, UploadResponse, UploadError } from './types';

/**
 * State returned by useLaravelUpload
 */
export interface UseLaravelUploadResult {
    /** Function to upload a file */
    upload: (file: File, additionalData?: Record<string, string>) => Promise<UploadResponse | null>;
    /** Progress (0-100) */
    progress: number;
    /** Upload in progress */
    isUploading: boolean;
    /** Error if any */
    error: UploadError | null;
    /** Last successful response */
    result: UploadResponse | null;
    /** Reset state */
    reset: () => void;
}

/**
 * Validate a file before upload
 */
function validateFile(
    file: File,
    maxSize: number,
    allowedTypes: string[]
): UploadError | null {
    // Check size
    if (file.size > maxSize) {
        return {
            message: `File is too large. Max size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
            code: 'FILE_TOO_LARGE',
            details: { maxSize, fileSize: file.size },
        };
    }

    // Check MIME type
    if (allowedTypes.length > 0) {
        const isAllowed = allowedTypes.some((type) => {
            if (type.endsWith('/*')) {
                const category = type.replace('/*', '');
                return file.type.startsWith(category);
            }
            return file.type === type;
        });

        if (!isAllowed) {
            return {
                message: `File type not allowed: ${file.type}`,
                code: 'INVALID_TYPE',
                details: { allowedTypes, fileType: file.type },
            };
        }
    }

    return null;
}

/**
 * Hook to upload a file to Laravel with progress tracking
 * 
 * @example
 * ```tsx
 * const { upload, progress, isUploading, error, result } = useLaravelUpload({
 *   endpoint: '/api/files',
 *   maxSize: 10 * 1024 * 1024, // 10MB
 *   allowedTypes: ['image/*', 'application/pdf'],
 *   onProgress: (percent) => console.log(`${percent}%`),
 *   onSuccess: (response) => console.log('Uploaded:', response),
 * });
 * 
 * // Usage
 * const handleFileChange = (e) => {
 *   const file = e.target.files[0];
 *   if (file) {
 *     upload(file, { folder: 'avatars' });
 *   }
 * };
 * ```
 */
export function useLaravelUpload(
    options: UseLaravelUploadOptions
): UseLaravelUploadResult {
    const {
        endpoint,
        maxSize = 10 * 1024 * 1024, // 10MB
        allowedTypes = [],
        fieldName = 'file',
        onProgress,
        onSuccess,
        onError,
        headers = {},
    } = options;

    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<UploadError | null>(null);
    const [result, setResult] = useState<UploadResponse | null>(null);

    const reset = useCallback(() => {
        setProgress(0);
        setError(null);
        setResult(null);
    }, []);

    const upload = useCallback(async (
        file: File,
        additionalData?: Record<string, string>
    ): Promise<UploadResponse | null> => {
        // Reset state
        reset();

        // Validate file
        const validationError = validateFile(file, maxSize, allowedTypes);
        if (validationError) {
            setError(validationError);
            onError?.(validationError);
            return null;
        }

        setIsUploading(true);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append(fieldName, file);

            // Add additional data
            if (additionalData) {
                Object.entries(additionalData).forEach(([key, value]) => {
                    formData.append(key, value);
                });
            }

            // Get auth token
            const token = getCookie(STORAGE_KEYS.ACCESS_TOKEN);

            // Make request with progress
            const response = await axios.post<UploadResponse>(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...headers,
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                        onProgress?.(percent);
                    }
                },
            });

            const uploadResult = response.data;
            setResult(uploadResult);
            setProgress(100);
            onSuccess?.(uploadResult);

            return uploadResult;
        } catch (err) {
            const uploadError: UploadError = {
                message: err instanceof Error ? err.message : 'Upload failed',
                code: 'UPLOAD_FAILED',
                details: err,
            };

            setError(uploadError);
            onError?.(uploadError);

            return null;
        } finally {
            setIsUploading(false);
        }
    }, [endpoint, maxSize, allowedTypes, fieldName, headers, onProgress, onSuccess, onError, reset]);

    return {
        upload,
        progress,
        isUploading,
        error,
        result,
        reset,
    };
}
