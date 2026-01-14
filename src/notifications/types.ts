/**
 * Types pour les notifications
 */

/**
 * Type de notification
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Position des notifications
 */
export type NotificationPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

/**
 * Notification individuelle
 */
export interface Notification {
    /** ID unique */
    id: string;
    /** Type de notification */
    type: NotificationType;
    /** Titre */
    title?: string;
    /** Message */
    message: string;
    /** Durée avant auto-dismiss (ms, 0 = permanent) */
    duration?: number;
    /** Peut être fermée manuellement */
    dismissible?: boolean;
    /** Timestamp de création */
    createdAt: number;
    /** Action optionnelle */
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Options pour créer une notification
 */
export interface NotificationOptions {
    /** Type de notification */
    type: NotificationType;
    /** Titre */
    title?: string;
    /** Message */
    message: string;
    /** Durée avant auto-dismiss (ms, default: 5000, 0 = permanent) */
    duration?: number;
    /** Peut être fermée manuellement (default: true) */
    dismissible?: boolean;
    /** Action optionnelle */
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Configuration du NotificationProvider
 */
export interface NotificationProviderConfig {
    /** Position des notifications (default: top-right) */
    position?: NotificationPosition;
    /** Durée par défaut (default: 5000ms) */
    defaultDuration?: number;
    /** Nombre max de notifications visibles (default: 5) */
    maxNotifications?: number;
    /** Z-index (default: 9999) */
    zIndex?: number;
}
