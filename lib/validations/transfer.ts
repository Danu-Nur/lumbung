import * as z from "zod";

export const transferItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

export const transferSchema = z.object({
    fromWarehouseId: z.string().min(1, "Source warehouse is required"),
    toWarehouseId: z.string().min(1, "Destination warehouse is required"),
    notes: z.string().optional(),
    items: z.array(transferItemSchema).min(1, "Transfer must have at least one item"),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: "Cannot transfer to the same warehouse",
    path: ["toWarehouseId"],
});

export type TransferFormValues = z.infer<typeof transferSchema>;
