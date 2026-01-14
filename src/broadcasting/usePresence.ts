'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEcho } from './EchoProvider';
import type { PresenceMember, PresenceChannelState } from './types';

/**
 * Options pour usePresence
 */
export interface UsePresenceOptions {
    /** Activer le channel (default: true) */
    enabled?: boolean;
}

/**
 * État retourné par usePresence
 */
export interface UsePresenceResult extends PresenceChannelState {
    /** Quitter le channel */
    leave: () => void;
    /** Écouter un événement personnalisé */
    listen: <T = unknown>(event: string, callback: (data: T) => void) => void;
}

/**
 * Hook pour les channels de présence Laravel Echo
 * Permet de voir qui est présent sur un channel et d'être notifié des arrivées/départs
 * 
 * @example
 * ```tsx
 * function OnlineUsers() {
 *   const { members, me, isConnected } = usePresence('room.1');
 * 
 *   return (
 *     <div>
 *       <h3>Users online: {members.length}</h3>
 *       <ul>
 *         {members.map((member) => (
 *           <li key={member.id}>
 *             {member.info.name} {member.id === me?.id && '(you)'}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePresence(
    channelName: string,
    options: UsePresenceOptions = {}
): UsePresenceResult {
    const { echo, isConnected: echoConnected } = useEcho();
    const { enabled = true } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [members, setMembers] = useState<PresenceMember[]>([]);
    const [me, setMe] = useState<PresenceMember | null>(null);
    const [events, setEvents] = useState<Array<{ event: string; data: unknown; timestamp: number }>>([]);

    useEffect(() => {
        if (!echo || !enabled || !echoConnected) return;

        try {
            const channel = echo.join(channelName);

            channel
                .here((currentMembers: unknown[]) => {
                    const formattedMembers = currentMembers.map((m) => ({
                        id: (m as { id: string | number }).id,
                        info: m as Record<string, unknown>,
                    }));
                    setMembers(formattedMembers);
                    setIsConnected(true);
                    setError(null);
                })
                .joining((member: unknown) => {
                    const newMember: PresenceMember = {
                        id: (member as { id: string | number }).id,
                        info: member as Record<string, unknown>,
                    };
                    setMembers((prev) => [...prev, newMember]);
                    setEvents((prev) => [
                        { event: 'joining', data: member, timestamp: Date.now() },
                        ...prev.slice(0, 99),
                    ]);
                })
                .leaving((member: unknown) => {
                    const memberId = (member as { id: string | number }).id;
                    setMembers((prev) => prev.filter((m) => m.id !== memberId));
                    setEvents((prev) => [
                        { event: 'leaving', data: member, timestamp: Date.now() },
                        ...prev.slice(0, 99),
                    ]);
                })
                .error((err: unknown) => {
                    setError(err instanceof Error ? err : new Error('Presence channel error'));
                    setIsConnected(false);
                });

            // Déterminer "me" à partir du premier membre avec un ID correspondant
            // Note: Cela dépend de la structure de votre auth
            channel.subscribed(() => {
                // Le premier appel here() aura déjà défini les membres
                // On peut essayer de récupérer l'utilisateur actuel d'une autre manière si nécessaire
            });

            return () => {
                echo.leave(channelName);
                setIsConnected(false);
                setMembers([]);
                setMe(null);
            };
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to join presence channel'));
        }
    }, [echo, channelName, enabled, echoConnected]);

    const leave = useCallback(() => {
        if (!echo) return;
        echo.leave(channelName);
        setIsConnected(false);
        setMembers([]);
    }, [echo, channelName]);

    const listen = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
        if (!echo || !echoConnected) return;

        const channel = echo.join(channelName);
        channel.listen(event, (data: unknown) => {
            setEvents((prev) => [
                { event, data, timestamp: Date.now() },
                ...prev.slice(0, 99),
            ]);
            callback(data as T);
        });
    }, [echo, echoConnected, channelName]);

    return {
        isConnected,
        error,
        events,
        members,
        me,
        leave,
        listen,
    };
}
