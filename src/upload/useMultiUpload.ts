'use client';

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { getCookie } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import type { UseMultiUploadOptions, UploadFileState, UploadResponse, UploadError } from './types';

/**
 * Generate unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * State returned by useMultiUpload
 */
export interface UseMultiUploadResult {
    /** Files being uploaded */
    files: UploadFileState[];
    /** Add files to queue */
    addFiles: (files: FileList | File[]) => void;
    /** Remove file from queue */
    removeFile: (id: string) => void;
    /** Start upload of all pending files */
    startUpload: () => Promise<void>;
    /** Upload in progress */
    isUploading: boolean;
    /** Overall progress (0-100) */
    overallProgress: number;
    /** Reset all */
    reset: () => void;
    /** Number of successful files */
    successCount: number;
    /** Number of failed files */
    errorCount: number;
}

/**
 * Hook to upload multiple files in parallel
 * 
 * @example
 * ```tsx
 * const {
 *   files,
 *   addFiles,
 *   removeFile,
 *   startUpload,
 *   isUploading,
 *   overallProgress,
 * } = useMultiUpload({
 *   endpoint: '/api/files',
 *   maxConcurrent: 3,
 *   maxSize: 10 * 1024 * 1024,
 *   onFileSuccess: (file, response) => console.log(`${file.name} uploaded`),
 *   onAllComplete: (results) => console.log('All done:', results),
 * });
 * 
 * // In a file input
 * <input type="file" multiple onChange={(e) => addFiles(e.target.files)} />
 * <button onClick={startUpload} disabled={isUploading}>Upload All</button>
 * ```
 */
export function useMultiUpload(
    options: UseMultiUploadOptions
): UseMultiUploadResult {
    const {
        endpoint,
        maxSize = 10 * 1024 * 1024,
        allowedTypes = [],
        fieldName = 'file',
        maxConcurrent = 3,
        onProgress,
        onFileSuccess,
        onFileError,
        onAllComplete,
        headers = {},
    } = options;

    const [files, setFiles] = useState<UploadFileState[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

    const overallProgress = files.length > 0
        ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
        : 0;

    const successCount = files.filter((f) => f.status === 'success').length;
    const errorCount = files.filter((f) => f.status === 'error').length;

    const validateFile = useCallback((file: File): UploadError | null => {
        if (file.size > maxSize) {
            return {
                message: `File too large: ${file.name}`,
                code: 'FILE_TOO_LARGE',
            };
        }

        if (allowedTypes.length > 0) {
            const isAllowed = allowedTypes.some((type) => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.replace('/*', ''));
                }
                return file.type === type;
            });

            if (!isAllowed) {
                return {
                    message: `Type not allowed: ${file.type}`,
                    code: 'INVALID_TYPE',
                };
            }
        }

        return null;
    }, [maxSize, allowedTypes]);

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles);
        const newFileStates: UploadFileState[] = fileArray.map((file) => {
            const error = validateFile(file);
            return {
                id: generateId(),
                file,
                progress: 0,
                status: error ? 'error' : 'pending',
                error: error || undefined,
            };
        });

        setFiles((prev) => [...prev, ...newFileStates]);
    }, [validateFile]);

    const removeFile = useCallback((id: string) => {
        // Cancel upload if in progress
        const controller = abortControllersRef.current.get(id);
        if (controller) {
            controller.abort();
            abortControllersRef.current.delete(id);
        }

        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const uploadFile = useCallback(async (fileState: UploadFileState): Promise<void> => {
        const { id, file } = fileState;

        // Create AbortController to allow cancellation
        const controller = new AbortController();
        abortControllersRef.current.set(id, controller);

        // Update status
        setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, status: 'uploading' as const } : f))
        );

        try {
            const formData = new FormData();
            formData.append(fieldName, file);

            const token = getCookie(STORAGE_KEYS.ACCESS_TOKEN);

            const response = await axios.post<UploadResponse>(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...headers,
                },
                signal: controller.signal,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setFiles((prev) =>
                            prev.map((f) => (f.id === id ? { ...f, progress: percent } : f))
                        );
                        onProgress?.(percent);
                    }
                },
            });

            // Success
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === id
                        ? { ...f, status: 'success' as const, progress: 100, response: response.data }
                        : f
                )
            );

            onFileSuccess?.(file, response.data);
        } catch (err) {
            if (axios.isCancel(err)) {
                return; // Cancelled, no error
            }

            const error: UploadError = {
                message: err instanceof Error ? err.message : 'Upload failed',
                code: 'UPLOAD_FAILED',
                details: err,
            };

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === id ? { ...f, status: 'error' as const, error } : f
                )
            );

            onFileError?.(file, error);
        } finally {
            abortControllersRef.current.delete(id);
        }
    }, [endpoint, fieldName, headers, onProgress, onFileSuccess, onFileError]);

    const startUpload = useCallback(async () => {
        const pendingFiles = files.filter((f) => f.status === 'pending');
        if (pendingFiles.length === 0) return;

        setIsUploading(true);

        // Parallel upload with concurrency limit
        const queue = [...pendingFiles];
        const executing: Promise<void>[] = [];

        while (queue.length > 0 || executing.length > 0) {
            // Add uploads up to limit
            while (queue.length > 0 && executing.length < maxConcurrent) {
                const fileState = queue.shift()!;
                const promise = uploadFile(fileState).then(() => {
                    const index = executing.indexOf(promise);
                    if (index > -1) executing.splice(index, 1);
                });
                executing.push(promise);
            }

            // Wait for an upload to finish
            if (executing.length > 0) {
                await Promise.race(executing);
            }
        }

        setIsUploading(false);

        // Final callback
        setFiles((current) => {
            onAllComplete?.(current);
            return current;
        });
    }, [files, maxConcurrent, uploadFile, onAllComplete]);

    const reset = useCallback(() => {
        // Cancel all ongoing uploads
        abortControllersRef.current.forEach((controller) => controller.abort());
        abortControllersRef.current.clear();

        setFiles([]);
        setIsUploading(false);
    }, []);

    return {
        files,
        addFiles,
        removeFile,
        startUpload,
        isUploading,
        overallProgress,
        reset,
        successCount,
        errorCount,
    };
}
