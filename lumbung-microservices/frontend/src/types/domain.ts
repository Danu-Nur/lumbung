import { MovementType } from "@prisma/client";

// Category Types
export type CreateCategoryParams = {
    organizationId: string;
    name: string;
    description?: string;
    createdById?: string;
};

export type UpdateCategoryParams = {
    id: string;
    organizationId: string;
    name?: string;
    description?: string;
};

// Inventory Types
export type CreateInventoryMovementParams = {
    organizationId: string;
    warehouseId: string;
    productId: string;
    movementType: MovementType;
    quantity: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    createdById: string;
};

// Customer Types
export type CreateCustomerParams = {
    organizationId: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    taxId?: string;
    notes?: string;
};

export type UpdateCustomerParams = {
    id: string;
    organizationId: string;
    data: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        taxId?: string;
        notes?: string;
    };
};

// Supplier Types
export type CreateSupplierParams = {
    organizationId: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    taxId?: string;
    notes?: string;
};

export type UpdateSupplierParams = {
    id: string;
    organizationId: string;
    data: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        taxId?: string;
        notes?: string;
    };
};
