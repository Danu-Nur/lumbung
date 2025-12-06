import * as z from "zod";

export const purchaseOrderItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitCost: z.coerce.number().min(0, "Cost must be non-negative"),
});

export const purchaseOrderSchema = z.object({
    supplierId: z.string().min(1, "Supplier is required"),
    warehouseId: z.string().min(1, "Warehouse is required"),
    notes: z.string().optional(),
    items: z.array(purchaseOrderItemSchema).min(1, "Order must have at least one item"),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
