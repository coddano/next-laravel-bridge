'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type {
    Notification,
    NotificationOptions,
    NotificationProviderConfig,
    NotificationPosition,
} from './types';

/**
 * Generate unique ID
 */
function generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Notification context
 */
interface NotificationContextValue {
    notifications: Notification[];
    notify: (options: NotificationOptions) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
    success: (message: string, title?: string) => string;
    error: (message: string, title?: string) => string;
    warning: (message: string, title?: string) => string;
    info: (message: string, title?: string) => string;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/**
 * NotificationProvider Props
 */
interface NotificationProviderProps extends NotificationProviderConfig {
    children: ReactNode;
}

/**
 * Inline styles for positions
 */
const positionStyles: Record<NotificationPosition, React.CSSProperties> = {
    'top-left': { top: 16, left: 16 },
    'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
    'bottom-center': { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: 16, right: 16 },
};

/**
 * Styles for notification types
 */
const typeStyles: Record<string, React.CSSProperties> = {
    success: {
        backgroundColor: '#10b981',
        borderLeft: '4px solid #059669',
    },
    error: {
        backgroundColor: '#ef4444',
        borderLeft: '4px solid #dc2626',
    },
    warning: {
        backgroundColor: '#f59e0b',
        borderLeft: '4px solid #d97706',
    },
    info: {
        backgroundColor: '#3b82f6',
        borderLeft: '4px solid #2563eb',
    },
};

/**
 * Provider for notifications
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx or providers.tsx
 * import { NotificationProvider } from 'next-laravel-bridge';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <NotificationProvider position="top-right">
 *       {children}
 *     </NotificationProvider>
 *   );
 * }
 * ```
 */
export function NotificationProvider({
    children,
    position = 'top-right',
    defaultDuration = 5000,
    maxNotifications = 5,
    zIndex = 9999,
}: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const dismiss = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const dismissAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const notify = useCallback((options: NotificationOptions): string => {
        const id = generateId();
        const notification: Notification = {
            id,
            type: options.type,
            title: options.title,
            message: options.message,
            duration: options.duration ?? defaultDuration,
            dismissible: options.dismissible ?? true,
            createdAt: Date.now(),
            action: options.action,
        };

        setNotifications((prev) => {
            const updated = [notification, ...prev];
            // Limit the number of notifications
            if (updated.length > maxNotifications) {
                return updated.slice(0, maxNotifications);
            }
            return updated;
        });

        // Auto-dismiss
        if (notification.duration && notification.duration > 0) {
            setTimeout(() => {
                dismiss(id);
            }, notification.duration);
        }

        return id;
    }, [defaultDuration, maxNotifications, dismiss]);

    // Helpers for common types
    const success = useCallback((message: string, title?: string) => {
        return notify({ type: 'success', message, title });
    }, [notify]);

    const error = useCallback((message: string, title?: string) => {
        return notify({ type: 'error', message, title });
    }, [notify]);

    const warning = useCallback((message: string, title?: string) => {
        return notify({ type: 'warning', message, title });
    }, [notify]);

    const info = useCallback((message: string, title?: string) => {
        return notify({ type: 'info', message, title });
    }, [notify]);

    const value: NotificationContextValue = {
        notifications,
        notify,
        dismiss,
        dismissAll,
        success,
        error,
        warning,
        info,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}

            {/* Notifications container */}
            <div
                style={{
                    position: 'fixed',
                    ...positionStyles[position],
                    zIndex,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxWidth: 400,
                    width: '100%',
                    pointerEvents: 'none',
                }}
            >
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        style={{
                            ...typeStyles[notification.type],
                            color: 'white',
                            padding: '12px 16px',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            pointerEvents: 'auto',
                            animation: 'slideIn 0.3s ease-out',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                {notification.title && (
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                        {notification.title}
                                    </div>
                                )}
                                <div style={{ fontSize: 14 }}>{notification.message}</div>
                            </div>

                            {notification.dismissible && (
                                <button
                                    onClick={() => dismiss(notification.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        padding: 4,
                                        marginLeft: 8,
                                        opacity: 0.7,
                                        fontSize: 18,
                                        lineHeight: 1,
                                    }}
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {notification.action && (
                            <button
                                onClick={() => {
                                    notification.action?.onClick();
                                    dismiss(notification.id);
                                }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    marginTop: 8,
                                    alignSelf: 'flex-start',
                                    fontSize: 13,
                                }}
                            >
                                {notification.action.label}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Animation CSS */}
            <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </NotificationContext.Provider >
    );
}

/**
 * Hook to use notifications
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { notify, success, error } = useLaravelNotifications();
 * 
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       success('Data saved!', 'Success');
 *     } catch (e) {
 *       error('An error occurred', 'Error');
 *     }
 *   };
 * }
 * ```
 */
export function useLaravelNotifications(): NotificationContextValue {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useLaravelNotifications must be used within a NotificationProvider');
    }
    return context;
}
