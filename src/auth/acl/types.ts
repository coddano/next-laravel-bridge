export interface Permission {
    name: string;
    params?: any[];
}

export type PermissionCheck = string | Permission;

export interface GateOptions {
    superAdminRole?: string;
}

export interface UserWithPermissions {
    id: number | string;
    roles?: string[];
    permissions?: string[];
    [key: string]: any;
}
