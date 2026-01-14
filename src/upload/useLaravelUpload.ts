'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { getCookie } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import type { UseLaravelUploadOptions, UploadResponse, UploadError } from './types';

/**
 * État retourné par useLaravelUpload
 */
export interface UseLaravelUploadResult {
    /** Fonction pour uploader un fichier */
    upload: (file: File, additionalData?: Record<string, string>) => Promise<UploadResponse | null>;
    /** Progression (0-100) */
    progress: number;
    /** Upload en cours */
    isUploading: boolean;
    /** Erreur éventuelle */
    error: UploadError | null;
    /** Dernière réponse réussie */
    result: UploadResponse | null;
    /** Réinitialiser l'état */
    reset: () => void;
}

/**
 * Valider un fichier avant upload
 */
function validateFile(
    file: File,
    maxSize: number,
    allowedTypes: string[]
): UploadError | null {
    // Vérifier la taille
    if (file.size > maxSize) {
        return {
            message: `Le fichier est trop volumineux. Taille max: ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
            code: 'FILE_TOO_LARGE',
            details: { maxSize, fileSize: file.size },
        };
    }

    // Vérifier le type MIME
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
                message: `Type de fichier non autorisé: ${file.type}`,
                code: 'INVALID_TYPE',
                details: { allowedTypes, fileType: file.type },
            };
        }
    }

    return null;
}

/**
 * Hook pour uploader un fichier vers Laravel avec progression
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
 * // Utilisation
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
        // Réinitialiser l'état
        reset();

        // Valider le fichier
        const validationError = validateFile(file, maxSize, allowedTypes);
        if (validationError) {
            setError(validationError);
            onError?.(validationError);
            return null;
        }

        setIsUploading(true);

        try {
            // Créer le FormData
            const formData = new FormData();
            formData.append(fieldName, file);

            // Ajouter les données supplémentaires
            if (additionalData) {
                Object.entries(additionalData).forEach(([key, value]) => {
                    formData.append(key, value);
                });
            }

            // Récupérer le token d'auth
            const token = getCookie(STORAGE_KEYS.ACCESS_TOKEN);

            // Faire la requête avec progression
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
