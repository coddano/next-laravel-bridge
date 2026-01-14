/**
 * Déclarations de types pour les dépendances optionnelles
 * Ces modules sont importés dynamiquement et doivent être installés par l'utilisateur
 */

declare module 'laravel-echo' {
    interface EchoOptions {
        broadcaster: string;
        key: string;
        cluster?: string;
        forceTLS?: boolean;
        authEndpoint?: string;
        wsHost?: string;
        wsPort?: number;
        wssPort?: number;
        enabledTransports?: string[];
        auth?: {
            headers?: Record<string, string>;
        };
        [key: string]: unknown;
    }

    interface Channel {
        listen(event: string, callback: (data: unknown) => void): Channel;
        stopListening(event: string): Channel;
        subscribed(callback: () => void): Channel;
        error(callback: (error: unknown) => void): Channel;
    }

    interface PresenceChannel extends Channel {
        here(callback: (members: unknown[]) => void): PresenceChannel;
        joining(callback: (member: unknown) => void): PresenceChannel;
        leaving(callback: (member: unknown) => void): PresenceChannel;
    }

    class Echo {
        constructor(options: EchoOptions);
        channel(name: string): Channel;
        private(name: string): Channel;
        join(name: string): PresenceChannel;
        leave(name: string): void;
        disconnect(): void;
        connector: {
            pusher?: unknown;
            socket?: unknown;
        };
    }

    export default Echo;
}

declare module 'pusher-js' {
    class Pusher {
        constructor(key: string, options?: Record<string, unknown>);
    }
    export default Pusher;
}
