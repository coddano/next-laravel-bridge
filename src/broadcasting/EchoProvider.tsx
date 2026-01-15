'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { BroadcastConfig } from './types';

/**
 * Echo Interface (compatible with laravel-echo)
 * Note: User must install laravel-echo and pusher-js separately
 */
interface EchoInstance {
    channel(name: string): ChannelInstance;
    private(name: string): ChannelInstance;
    join(name: string): PresenceChannelInstance;
    leave(name: string): void;
    disconnect(): void;
    connector: {
        pusher?: unknown;
        socket?: unknown;
    };
}

interface ChannelInstance {
    listen(event: string, callback: (data: unknown) => void): ChannelInstance;
    stopListening(event: string): ChannelInstance;
    subscribed(callback: () => void): ChannelInstance;
    error(callback: (error: unknown) => void): ChannelInstance;
}

interface PresenceChannelInstance extends ChannelInstance {
    here(callback: (members: unknown[]) => void): PresenceChannelInstance;
    joining(callback: (member: unknown) => void): PresenceChannelInstance;
    leaving(callback: (member: unknown) => void): PresenceChannelInstance;
}

/**
 * Echo Context
 */
interface EchoContextValue {
    /** Echo Instance */
    echo: EchoInstance | null;
    /** Is connected? */
    isConnected: boolean;
    /** Connection error */
    error: Error | null;
    /** Reconnect */
    reconnect: () => void;
}

const EchoContext = createContext<EchoContextValue | null>(null);

/**
 * EchoProvider Props
 */
interface EchoProviderProps {
    children: ReactNode;
    config: BroadcastConfig;
    /** Auto-connect on mount (default: true) */
    autoConnect?: boolean;
}

/**
 * Provider for Laravel Echo
 * 
 * @example
 * ```tsx
 * // app/providers.tsx
 * import { EchoProvider } from 'next-laravel-bridge';
 * 
 * export function Providers({ children }) {
 *   return (
 *     <EchoProvider
 *       config={{
 *         driver: 'pusher',
 *         key: process.env.NEXT_PUBLIC_PUSHER_KEY,
 *         cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
 *         authEndpoint: '/api/broadcasting/auth',
 *       }}
 *     >
 *       {children}
 *     </EchoProvider>
 *   );
 * }
 * ```
 * 
 * Note: You must install laravel-echo and pusher-js:
 * npm install laravel-echo pusher-js
 */
export function EchoProvider({
    children,
    config,
    autoConnect = true,
}: EchoProviderProps) {
    const [echo, setEcho] = useState<EchoInstance | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const connect = useCallback(async () => {
        try {
            // Dynamic import of laravel-echo
            const { default: Echo } = await import('laravel-echo');

            // Import appropriate driver
            let pusher;
            if (config.driver === 'pusher' || config.driver === 'soketi') {
                const PusherModule = await import('pusher-js');
                pusher = PusherModule.default;
                // @ts-expect-error - Pusher must be global for Echo
                window.Pusher = pusher;
            }

            const echoConfig: Record<string, unknown> = {
                broadcaster: config.driver === 'soketi' ? 'pusher' : config.driver,
                key: config.key,
                cluster: config.cluster || 'mt1',
                forceTLS: config.encrypted ?? true,
                authEndpoint: config.authEndpoint || '/broadcasting/auth',
            };

            // Soketi/Self-hosted configuration
            if (config.driver === 'soketi' || config.host) {
                echoConfig.wsHost = config.host;
                echoConfig.wsPort = config.port || 6001;
                echoConfig.wssPort = config.port || 6001;
                echoConfig.enabledTransports = ['ws', 'wss'];
            }

            // Authentication headers
            if (config.bearerToken || config.authHeaders) {
                echoConfig.auth = {
                    headers: {
                        ...(config.bearerToken ? { Authorization: `Bearer ${config.bearerToken}` } : {}),
                        ...config.authHeaders,
                    },
                };
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const echoInstance = new Echo(echoConfig as any) as EchoInstance;
            setEcho(echoInstance);
            setIsConnected(true);
            setError(null);
        } catch (err) {
            const connectionError = err instanceof Error
                ? err
                : new Error('Failed to connect to broadcast server');
            setError(connectionError);
            setIsConnected(false);
            console.error('Echo connection error:', err);
        }
    }, [config]);

    const reconnect = useCallback(() => {
        if (echo) {
            echo.disconnect();
        }
        connect();
    }, [echo, connect]);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            if (echo) {
                echo.disconnect();
            }
        };
    }, [autoConnect, connect]);

    const value: EchoContextValue = {
        echo,
        isConnected,
        error,
        reconnect,
    };

    return (
        <EchoContext.Provider value={value}>
            {children}
        </EchoContext.Provider>
    );
}

/**
 * Hook to access Echo instance
 */
export function useEcho(): EchoContextValue {
    const context = useContext(EchoContext);
    if (!context) {
        throw new Error('useEcho must be used within an EchoProvider');
    }
    return context;
}
