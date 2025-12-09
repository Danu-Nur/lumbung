import * as z from "zod";

export const salesOrderItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Price must be non-negative"),
    discount: z.coerce.number().min(0, "Discount must be non-negative").default(0),
});

export const salesOrderSchema = z.object({
    customerId: z.string().optional(),
    warehouseId: z.string().min(1, "Warehouse is required"),
    notes: z.string().optional(),
    items: z.array(salesOrderItemSchema).min(1, "Order must have at least one item"),
});

export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;
