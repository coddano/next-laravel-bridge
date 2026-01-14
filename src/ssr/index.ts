// Module SSR - Support Server-Side Rendering pour Next.js
export { getServerSideAuth, withServerAuth } from './getServerSideAuth';
export type { WithServerAuthConfig, GetServerSidePropsContext, GetServerSidePropsResult } from './getServerSideAuth';

export type {
    ServerAuthContext,
    ServerUser,
    GetServerAuthOptions,
    ServerAuthProps,
} from './types';
