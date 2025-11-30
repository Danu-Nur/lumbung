// RBAC (Role-Based Access Control) System
// Supports Super Admin (cross-tenant) and Organization Admin (tenant-scoped)

export const PERMISSIONS = {
    // Inventory permissions
    INVENTORY: {
        CREATE: 'inventory:create',
        READ: 'inventory:read',
        UPDATE: 'inventory:update',
        DELETE: 'inventory:delete',
    },
    // Sales Order permissions
    SALES_ORDERS: {
        CREATE: 'sales-orders:create',
        READ: 'sales-orders:read',
        UPDATE: 'sales-orders:update',
        DELETE: 'sales-orders:delete',
        FULFILL: 'sales-orders:fulfill',
        INVOICE: 'sales-orders:invoice',
    },
    // Purchase Order permissions
    PURCHASE_ORDERS: {
        CREATE: 'purchase-orders:create',
        READ: 'purchase-orders:read',
        UPDATE: 'purchase-orders:update',
        DELETE: 'purchase-orders:delete',
        RECEIVE: 'purchase-orders:receive',
    },
    // Warehouse permissions
    WAREHOUSES: {
        CREATE: 'warehouses:create',
        READ: 'warehouses:read',
        UPDATE: 'warehouses:update',
        DELETE: 'warehouses:delete',
    },
    // Stock Transfer permissions
    TRANSFERS: {
        CREATE: 'transfers:create',
        READ: 'transfers:read',
        UPDATE: 'transfers:update',
        DELETE: 'transfers:delete',
        COMPLETE: 'transfers:complete',
    },
    // Stock Adjustment permissions
    ADJUSTMENTS: {
        CREATE: 'adjustments:create',
        READ: 'adjustments:read',
    },
    // Customer permissions
    CUSTOMERS: {
        CREATE: 'customers:create',
        READ: 'customers:read',
        UPDATE: 'customers:update',
        DELETE: 'customers:delete',
    },
    // Supplier permissions
    SUPPLIERS: {
        CREATE: 'suppliers:create',
        READ: 'suppliers:read',
        UPDATE: 'suppliers:update',
        DELETE: 'suppliers:delete',
    },
    // User Management permissions
    USERS: {
        CREATE: 'users:create',
        READ: 'users:read',
        UPDATE: 'users:update',
        DELETE: 'users:delete',
        MANAGE_ROLES: 'users:manage-roles',
    },
    // Organization Management permissions (Super Admin only)
    ORGANIZATIONS: {
        CREATE: 'organizations:create',
        READ: 'organizations:read',
        UPDATE: 'organizations:update',
        DELETE: 'organizations:delete',
    },
    // Settings permissions
    SETTINGS: {
        READ: 'settings:read',
        UPDATE: 'settings:update',
    },
} as const;

export const ROLES = {
    SUPER_ADMIN: 'SuperAdmin',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    STAFF: 'Staff',
    VIEWER: 'Viewer',
} as const;

export type UserWithRole = {
    id: string;
    email: string;
    name: string;
    roleId: string;
    organizationId: string | null;
    role: {
        id: string;
        name: string;
        rolePermissions: Array<{
            permission: {
                name: string;
            };
        }>;
    };
};

/**
 * Check if user is Super Admin (has cross-tenant access)
 */
export function isSuperAdmin(user: UserWithRole): boolean {
    return user.role.name === ROLES.SUPER_ADMIN;
}

/**
 * Check if user is Admin of a specific organization
 */
export function isOrgAdmin(user: UserWithRole, organizationId?: string): boolean {
    if (isSuperAdmin(user)) return true;

    if (!organizationId) {
        return user.role.name === ROLES.ADMIN;
    }

    return user.role.name === ROLES.ADMIN && user.organizationId === organizationId;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserWithRole, permission: string): boolean {
    // Super Admin has all permissions
    if (isSuperAdmin(user)) return true;

    // Check if user's role has the permission
    return user.role.rolePermissions.some(
        (rp) => rp.permission.name === permission
    );
}

/**
 * Check if user can access a specific organization's data
 */
export function canAccessOrganization(
    user: UserWithRole,
    organizationId: string
): boolean {
    // Super Admin can access all organizations
    if (isSuperAdmin(user)) return true;

    // Other users can only access their own organization
    return user.organizationId === organizationId;
}

/**
 * Get user's accessible organization IDs
 * Super Admin gets all, others get only their own
 */
export async function getAccessibleOrganizationIds(
    user: UserWithRole
): Promise<string[]> {
    if (isSuperAdmin(user)) {
        // Super Admin can access all organizations
        // This should be populated from database in actual implementation
        return ['*']; // Wildcard to indicate all organizations
    }

    // Regular users can only access their own organization
    return user.organizationId ? [user.organizationId] : [];
}

/**
 * Require permission middleware helper
 * Throws error if user doesn't have permission
 */
export function requirePermission(user: UserWithRole, permission: string): void {
    if (!hasPermission(user, permission)) {
        throw new Error(`Access denied: Missing permission ${permission}`);
    }
}

/**
 * Require organization access middleware helper
 * Throws error if user can't access the organization
 */
export function requireOrganizationAccess(
    user: UserWithRole,
    organizationId: string
): void {
    if (!canAccessOrganization(user, organizationId)) {
        throw new Error('Access denied: Cannot access this organization');
    }
}
