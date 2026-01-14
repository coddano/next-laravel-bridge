'use client';

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { getCookie } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import type { UseMultiUploadOptions, UploadFileState, UploadResponse, UploadError } from './types';

/**
 * Générer un ID unique
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * État retourné par useMultiUpload
 */
export interface UseMultiUploadResult {
    /** Fichiers en cours d'upload */
    files: UploadFileState[];
    /** Ajouter des fichiers à la queue */
    addFiles: (files: FileList | File[]) => void;
    /** Retirer un fichier de la queue */
    removeFile: (id: string) => void;
    /** Démarrer l'upload de tous les fichiers en attente */
    startUpload: () => Promise<void>;
    /** Upload en cours */
    isUploading: boolean;
    /** Progression globale (0-100) */
    overallProgress: number;
    /** Réinitialiser tout */
    reset: () => void;
    /** Nombre de fichiers réussis */
    successCount: number;
    /** Nombre de fichiers échoués */
    errorCount: number;
}

/**
 * Hook pour uploader plusieurs fichiers en parallèle
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
 * // Dans un input file
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
                message: `Fichier trop volumineux: ${file.name}`,
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
                    message: `Type non autorisé: ${file.type}`,
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
        // Annuler l'upload si en cours
        const controller = abortControllersRef.current.get(id);
        if (controller) {
            controller.abort();
            abortControllersRef.current.delete(id);
        }

        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const uploadFile = useCallback(async (fileState: UploadFileState): Promise<void> => {
        const { id, file } = fileState;

        // Créer un AbortController pour pouvoir annuler
        const controller = new AbortController();
        abortControllersRef.current.set(id, controller);

        // Mettre à jour le statut
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

            // Succès
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
                return; // Annulé, pas d'erreur
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

        // Upload en parallèle avec limite de concurrence
        const queue = [...pendingFiles];
        const executing: Promise<void>[] = [];

        while (queue.length > 0 || executing.length > 0) {
            // Ajouter des uploads jusqu'à la limite
            while (queue.length > 0 && executing.length < maxConcurrent) {
                const fileState = queue.shift()!;
                const promise = uploadFile(fileState).then(() => {
                    const index = executing.indexOf(promise);
                    if (index > -1) executing.splice(index, 1);
                });
                executing.push(promise);
            }

            // Attendre qu'un upload se termine
            if (executing.length > 0) {
                await Promise.race(executing);
            }
        }

        setIsUploading(false);

        // Callback final
        setFiles((current) => {
            onAllComplete?.(current);
            return current;
        });
    }, [files, maxConcurrent, uploadFile, onAllComplete]);

    const reset = useCallback(() => {
        // Annuler tous les uploads en cours
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
