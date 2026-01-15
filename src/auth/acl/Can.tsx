import React from 'react';
import { useGate } from './useGate';

interface CanProps {
    ability: string;
    children: React.ReactNode;
    else?: React.ReactNode;
}

/**
 * Component to conditionally render content based on permissions
 */
export function Can({ ability, children, else: fallback = null }: CanProps) {
    const { can } = useGate();

    if (can(ability)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
