import {
    SalesOrder, SalesOrderItem, Product, Customer, Warehouse,
    PurchaseOrder, PurchaseOrderItem, Supplier,
    StockTransfer, StockTransferItem,
    StockAdjustment, User, Role, Category, InventoryItem,
    StockOpname, StockOpnameItem
} from "@prisma/client";

// Sales Order Types
export type SerializedSalesOrderItem = Omit<SalesOrderItem, "unitPrice" | "discount" | "lineTotal"> & {
    unitPrice: number;
    discount: number;
    lineTotal: number;
    product: Omit<Product, "sellingPrice" | "costPrice"> & {
        sellingPrice: number;
        costPrice: number;
    };
};

export type SerializedSalesOrder = Omit<SalesOrder, "subtotal" | "tax" | "discount" | "total"> & {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    customer: Customer | null;
    warehouse: Warehouse;
    items: SerializedSalesOrderItem[];
};

// Purchase Order Types
export type SerializedPurchaseOrderItem = Omit<PurchaseOrderItem, "unitCost" | "lineTotal"> & {
    unitCost: number;
    lineTotal: number;
    product: Omit<Product, "sellingPrice" | "costPrice"> & {
        sellingPrice: number;
        costPrice: number;
    };
};

export type SerializedPurchaseOrder = Omit<PurchaseOrder, "subtotal" | "tax" | "total"> & {
    subtotal: number;
    tax: number;
    total: number;
    supplier: Supplier;
    warehouse: Warehouse;
    items: SerializedPurchaseOrderItem[];
};

// Stock Transfer Types
export type SerializedStockTransferItem = StockTransferItem & {
    product: Omit<Product, "sellingPrice" | "costPrice"> & {
        sellingPrice: number;
        costPrice: number;
    };
};

export type SerializedStockTransfer = StockTransfer & {
    fromWarehouse: Warehouse;
    toWarehouse: Warehouse;
    items: SerializedStockTransferItem[];
};

// Stock Adjustment Types
export type SerializedStockAdjustment = StockAdjustment & {
    product: Omit<Product, "sellingPrice" | "costPrice"> & {
        sellingPrice: number;
        costPrice: number;
    };
    warehouse: Warehouse;
    createdBy: User;
};

// User Types
export type UserWithRole = User & {
    role: Role;
};

// Product Types
export type SerializedCategory = Category;

export type SerializedProduct = Omit<Product, "sellingPrice" | "costPrice"> & {
    sellingPrice: number;
    costPrice: number;
    category: Category | null;
    inventoryItems: (InventoryItem & { warehouse: Warehouse })[];
};

// Stock Opname Types
export type SerializedStockOpnameItem = StockOpnameItem & {
    product: Omit<Product, "sellingPrice" | "costPrice"> & {
        sellingPrice: number;
        costPrice: number;
    };
};

export type SerializedStockOpname = StockOpname & {
    warehouse: Warehouse;
    items: SerializedStockOpnameItem[];
    createdBy: User;
};

// Supplier Types
export type SerializedSupplier = Supplier;
