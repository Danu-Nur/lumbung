import * as z from "zod";

export const adjustmentFormSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    warehouseId: z.string().min(1, "Warehouse is required"),
    adjustmentType: z.enum(["increase", "decrease"]),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    reason: z.string().min(1, "Reason is required"),
    notes: z.string().optional(),
});

export type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>;
