'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEcho } from './EchoProvider';
import type { ChannelEvent, ChannelState } from './types';

/**
 * Options for useChannel
 */
export interface UseChannelOptions {
    /** Enable channel (default: true) */
    enabled?: boolean;
    /** Keep event history (default: true) */
    keepHistory?: boolean;
    /** Max events in history (default: 100) */
    maxHistory?: number;
}

/**
 * State returned by useChannel
 */
export interface UseChannelResult extends ChannelState {
    /** Subscribe to an event */
    listen: <T = unknown>(event: string, callback: (data: T) => void) => void;
    /** Unsubscribe from an event */
    stopListening: (event: string) => void;
    /** Leave channel */
    leave: () => void;
}

/**
 * Hook to listen to a public Laravel Echo channel
 * 
 * @example
 * ```tsx
 * function ChatRoom() {
 *   const { events, isConnected } = useChannel('chat-room', {
 *     'message.new': (message) => {
 *       console.log('New message:', message);
 *     },
 *     'user.typing': (user) => {
 *       console.log('User typing:', user);
 *     },
 *   });
 * 
 *   return (
 *     <div>
 *       {isConnected ? 'Connected' : 'Connecting...'}
 *       <ul>
 *         {events.map((e, i) => (
 *           <li key={i}>{JSON.stringify(e.data)}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useChannel(
    channelName: string,
    eventHandlers: Record<string, (data: unknown) => void> = {},
    options: UseChannelOptions = {}
): UseChannelResult {
    const { echo, isConnected: echoConnected } = useEcho();
    const {
        enabled = true,
        keepHistory = true,
        maxHistory = 100,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [events, setEvents] = useState<ChannelEvent[]>([]);

    const addEvent = useCallback((event: string, data: unknown) => {
        if (!keepHistory) return;

        const newEvent: ChannelEvent = {
            event,
            data,
            timestamp: Date.now(),
        };

        setEvents((prev) => {
            const updated = [newEvent, ...prev];
            if (updated.length > maxHistory) {
                return updated.slice(0, maxHistory);
            }
            return updated;
        });
    }, [keepHistory, maxHistory]);

    useEffect(() => {
        if (!echo || !enabled || !echoConnected) return;

        try {
            const channel = echo.channel(channelName);

            channel
                .subscribed(() => {
                    setIsConnected(true);
                    setError(null);
                })
                .error((err: unknown) => {
                    setError(err instanceof Error ? err : new Error('Channel error'));
                    setIsConnected(false);
                });

            // Listen to configured events
            Object.entries(eventHandlers).forEach(([event, handler]) => {
                channel.listen(event, (data: unknown) => {
                    addEvent(event, data);
                    handler(data);
                });
            });

            return () => {
                echo.leave(channelName);
                setIsConnected(false);
            };
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to subscribe'));
        }
    }, [echo, channelName, enabled, echoConnected, eventHandlers, addEvent]);

    const listen = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
        if (!echo || !echoConnected) return;

        const channel = echo.channel(channelName);
        channel.listen(event, (data: unknown) => {
            addEvent(event, data);
            callback(data as T);
        });
    }, [echo, echoConnected, channelName, addEvent]);

    const stopListening = useCallback((event: string) => {
        if (!echo || !echoConnected) return;

        const channel = echo.channel(channelName);
        channel.stopListening(event);
    }, [echo, echoConnected, channelName]);

    const leave = useCallback(() => {
        if (!echo) return;
        echo.leave(channelName);
        setIsConnected(false);
    }, [echo, channelName]);

    return {
        isConnected,
        error,
        events,
        listen,
        stopListening,
        leave,
    };
}

/**
 * Hook to listen to a private Laravel Echo channel
 * 
 * @example
 * ```tsx
 * // Private channel (requires authentication)
 * const { events } = usePrivateChannel('orders.123', {
 *   'OrderShipped': (order) => console.log('Order shipped:', order),
 * });
 * ```
 */
export function usePrivateChannel(
    channelName: string,
    eventHandlers: Record<string, (data: unknown) => void> = {},
    options: UseChannelOptions = {}
): UseChannelResult {
    const { echo, isConnected: echoConnected } = useEcho();
    const {
        enabled = true,
        keepHistory = true,
        maxHistory = 100,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [events, setEvents] = useState<ChannelEvent[]>([]);

    const addEvent = useCallback((event: string, data: unknown) => {
        if (!keepHistory) return;

        const newEvent: ChannelEvent = {
            event,
            data,
            timestamp: Date.now(),
        };

        setEvents((prev) => {
            const updated = [newEvent, ...prev];
            if (updated.length > maxHistory) {
                return updated.slice(0, maxHistory);
            }
            return updated;
        });
    }, [keepHistory, maxHistory]);

    useEffect(() => {
        if (!echo || !enabled || !echoConnected) return;

        try {
            const channel = echo.private(channelName);

            channel
                .subscribed(() => {
                    setIsConnected(true);
                    setError(null);
                })
                .error((err: unknown) => {
                    setError(err instanceof Error ? err : new Error('Private channel error'));
                    setIsConnected(false);
                });

            // Listen to configured events
            Object.entries(eventHandlers).forEach(([event, handler]) => {
                channel.listen(event, (data: unknown) => {
                    addEvent(event, data);
                    handler(data);
                });
            });

            return () => {
                echo.leave(channelName);
                setIsConnected(false);
            };
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to subscribe to private channel'));
        }
    }, [echo, channelName, enabled, echoConnected, eventHandlers, addEvent]);

    const listen = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
        if (!echo || !echoConnected) return;

        const channel = echo.private(channelName);
        channel.listen(event, (data: unknown) => {
            addEvent(event, data);
            callback(data as T);
        });
    }, [echo, echoConnected, channelName, addEvent]);

    const stopListening = useCallback((event: string) => {
        if (!echo || !echoConnected) return;

        const channel = echo.private(channelName);
        channel.stopListening(event);
    }, [echo, echoConnected, channelName]);

    const leave = useCallback(() => {
        if (!echo) return;
        echo.leave(channelName);
        setIsConnected(false);
    }, [echo, channelName]);

    return {
        isConnected,
        error,
        events,
        listen,
        stopListening,
        leave,
    };
}
