import { useCallback } from 'react';
import { useAuth } from '../useAuth';
import { GateOptions, PermissionCheck, UserWithPermissions } from './types';

/**
 * Hook to manage permissions and roles (ACL)
 * 
 * @example
 * ```tsx
 * const { can, hasRole } = useGate();
 * 
 * if (can('edit-posts')) {
 *   return <EditButton />;
 * }
 * ```
 */
export function useGate(options: GateOptions = {}) {
    const { user } = useAuth();
    const userData = user as UserWithPermissions | null;

    /**
     * Check if user has a specific role
     */
    const hasRole = useCallback((role: string): boolean => {
        if (!userData || !userData.roles) return false;

        // Super admin bypass if configured
        if (options.superAdminRole && userData.roles.includes(options.superAdminRole)) {
            return true;
        }

        return userData.roles.includes(role);
    }, [userData, options.superAdminRole]);

    /**
     * Check if user has multiple roles (OR)
     */
    const hasAnyRole = useCallback((roles: string[]): boolean => {
        return roles.some(role => hasRole(role));
    }, [hasRole]);

    /**
     * Check if user has multiple roles (AND)
     */
    const hasAllRoles = useCallback((roles: string[]): boolean => {
        return roles.every(role => hasRole(role));
    }, [hasRole]);

    /**
     * Check if user has a specific permission
     */
    const can = useCallback((permission: PermissionCheck): boolean => {
        if (!userData) return false;

        // Super admin bypass
        if (options.superAdminRole && userData.roles && userData.roles.includes(options.superAdminRole)) {
            return true;
        }

        if (!userData.permissions) return false;

        const permissionName = typeof permission === 'string' ? permission : permission.name;

        // Simple check for now (exact match)
        // TODO: Add support for wildcards like 'posts.*'
        return userData.permissions.includes(permissionName);
    }, [userData, options.superAdminRole]);

    /**
     * Check if user is denied a specific permission
     */
    const cannot = useCallback((permission: PermissionCheck): boolean => {
        return !can(permission);
    }, [can]);

    return {
        hasRole,
        hasAnyRole,
        hasAllRoles,
        can,
        cannot,
        user: userData
    };
}
