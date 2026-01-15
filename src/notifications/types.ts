/**
 * Notification types
 */

/**
 * Notification type
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification position
 */
export type NotificationPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

/**
 * Individual notification
 */
export interface Notification {
    /** Unique ID */
    id: string;
    /** Notification type */
    type: NotificationType;
    /** Title */
    title?: string;
    /** Message */
    message: string;
    /** Duration before auto-dismiss (ms, 0 = permanent) */
    duration?: number;
    /** Can be dismissed manually */
    dismissible?: boolean;
    /** Creation timestamp */
    createdAt: number;
    /** Optional action */
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Options for creating a notification
 */
export interface NotificationOptions {
    /** Notification type */
    type: NotificationType;
    /** Title */
    title?: string;
    /** Message */
    message: string;
    /** Duration before auto-dismiss (ms, default: 5000, 0 = permanent) */
    duration?: number;
    /** Can be dismissed manually (default: true) */
    dismissible?: boolean;
    /** Optional action */
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * NotificationProvider configuration
 */
export interface NotificationProviderConfig {
    /** Notification position (default: top-right) */
    position?: NotificationPosition;
    /** Default duration (default: 5000ms) */
    defaultDuration?: number;
    /** Max number of visible notifications (default: 5) */
    maxNotifications?: number;
    /** Z-index (default: 9999) */
    zIndex?: number;
}
