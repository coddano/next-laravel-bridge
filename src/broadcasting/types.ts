/**
 * Types pour le module Broadcasting (Laravel Echo)
 */

/**
 * Type de driver de broadcasting
 */
export type BroadcastDriver = 'pusher' | 'socket.io' | 'soketi' | 'ably';

/**
 * Configuration pour le broadcast
 */
export interface BroadcastConfig {
    /** Driver à utiliser */
    driver: BroadcastDriver;
    /** Clé d'application (Pusher/Soketi) */
    key: string;
    /** Cluster (Pusher) */
    cluster?: string;
    /** Host personnalisé (Soketi/Socket.io) */
    host?: string;
    /** Port personnalisé */
    port?: number;
    /** Utiliser HTTPS/WSS */
    encrypted?: boolean;
    /** Endpoint d'authentification (default: '/broadcasting/auth') */
    authEndpoint?: string;
    /** Headers supplémentaires pour l'auth */
    authHeaders?: Record<string, string>;
    /** Token d'authentification */
    bearerToken?: string;
}

/**
 * Événement de channel
 */
export interface ChannelEvent<T = unknown> {
    /** Nom de l'événement */
    event: string;
    /** Données de l'événement */
    data: T;
    /** Timestamp */
    timestamp: number;
}

/**
 * Membre d'un channel de présence
 */
export interface PresenceMember {
    /** ID unique du membre */
    id: string | number;
    /** Informations du membre */
    info: Record<string, unknown>;
}

/**
 * État d'un channel
 */
export interface ChannelState {
    /** Le channel est-il connecté ? */
    isConnected: boolean;
    /** Erreur éventuelle */
    error: Error | null;
    /** Événements reçus */
    events: ChannelEvent[];
}

/**
 * État d'un channel de présence
 */
export interface PresenceChannelState extends ChannelState {
    /** Membres actuels */
    members: PresenceMember[];
    /** Membre actuel (self) */
    me: PresenceMember | null;
}
