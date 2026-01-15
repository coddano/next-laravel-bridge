/**
 * Broadcasting (Laravel Echo) module types
 */

/**
 * Broadcast driver type
 */
export type BroadcastDriver = 'pusher' | 'socket.io' | 'soketi' | 'ably';

/**
 * Broadcast configuration
 */
export interface BroadcastConfig {
    /** Driver to use */
    driver: BroadcastDriver;
    /** Application Key (Pusher/Soketi) */
    key: string;
    /** Cluster (Pusher) */
    cluster?: string;
    /** Custom Host (Soketi/Socket.io) */
    host?: string;
    /** Custom Port */
    port?: number;
    /** Use HTTPS/WSS */
    encrypted?: boolean;
    /** Authentication endpoint (default: '/broadcasting/auth') */
    authEndpoint?: string;
    /** Additional credentials/headers for auth */
    authHeaders?: Record<string, string>;
    /** Authentication token */
    bearerToken?: string;
}

/**
 * Channel event
 */
export interface ChannelEvent<T = unknown> {
    /** Event Name */
    event: string;
    /** Event Data */
    data: T;
    /** Timestamp */
    timestamp: number;
}

/**
 * Member of a presence channel
 */
export interface PresenceMember {
    /** Unique Member ID */
    id: string | number;
    /** Member Information */
    info: Record<string, unknown>;
}

/**
 * Channel State
 */
export interface ChannelState {
    /** Is the channel connected? */
    isConnected: boolean;
    /** Potential Error */
    error: Error | null;
    /** Received Events */
    events: ChannelEvent[];
}

/**
 * Presence Channel State
 */
export interface PresenceChannelState extends ChannelState {
    /** Current Members */
    members: PresenceMember[];
    /** Current Member (self) */
    me: PresenceMember | null;
}
