/**
 * Types pour l'upload de fichiers
 */

/**
 * Options pour useLaravelUpload
 */
export interface UseLaravelUploadOptions {
    /** Endpoint d'upload */
    endpoint: string;
    /** Taille maximale en bytes (default: 10MB) */
    maxSize?: number;
    /** Types MIME autorisés */
    allowedTypes?: string[];
    /** Nom du champ de fichier (default: 'file') */
    fieldName?: string;
    /** Callback de progression */
    onProgress?: (percent: number) => void;
    /** Callback de succès */
    onSuccess?: (response: UploadResponse) => void;
    /** Callback d'erreur */
    onError?: (error: UploadError) => void;
    /** Headers supplémentaires */
    headers?: Record<string, string>;
}

/**
 * Réponse d'upload standard
 */
export interface UploadResponse {
    /** URL du fichier uploadé */
    url: string;
    /** Chemin du fichier */
    path: string;
    /** Nom original du fichier */
    originalName: string;
    /** Taille en bytes */
    size: number;
    /** Type MIME */
    mimeType: string;
    /** Données supplémentaires */
    [key: string]: unknown;
}

/**
 * Erreur d'upload
 */
export interface UploadError {
    /** Message d'erreur */
    message: string;
    /** Code d'erreur */
    code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NETWORK_ERROR';
    /** Détails supplémentaires */
    details?: unknown;
}

/**
 * État d'un fichier en upload
 */
export interface UploadFileState {
    /** ID unique */
    id: string;
    /** Fichier */
    file: File;
    /** Progression (0-100) */
    progress: number;
    /** Statut */
    status: 'pending' | 'uploading' | 'success' | 'error';
    /** Réponse en cas de succès */
    response?: UploadResponse;
    /** Erreur en cas d'échec */
    error?: UploadError;
}

/**
 * Options pour useMultiUpload
 */
export interface UseMultiUploadOptions extends Omit<UseLaravelUploadOptions, 'onSuccess' | 'onError'> {
    /** Upload concurrent max (default: 3) */
    maxConcurrent?: number;
    /** Callback quand un fichier est uploadé */
    onFileSuccess?: (file: File, response: UploadResponse) => void;
    /** Callback quand un fichier échoue */
    onFileError?: (file: File, error: UploadError) => void;
    /** Callback quand tous les fichiers sont traités */
    onAllComplete?: (results: UploadFileState[]) => void;
}
