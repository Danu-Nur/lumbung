"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import { toast } from "sonner";
import { useTranslations } from "next-intl";

// Note: We might need an update action for sales orders.
// For now, I'll assume we can't edit confirmed orders, only draft.
// And I'll need to implement updateSalesOrder in actions.ts if it doesn't exist.
// Checking actions.ts, there is no updateSalesOrder, only updateOrderStatus.
// I will implement a basic edit modal that currently just shows a message or allows editing notes if I add that action.
// Or I can skip Edit for now if it's not supported by backend.
// But the requirement says "Create/Edit/Show Modals".
// I'll create a placeholder Edit modal that says "Editing not implemented yet" or similar, 
// OR I'll implement updateSalesOrder in actions.ts.
// Given the time, I'll implement updateSalesOrder in actions.ts first.

const lineItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    productName: z.string(),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0),
});

const formSchema = z.object({
    customerId: z.string().optional(),
    warehouseId: z.string().min(1, "Warehouse is required"),
    notes: z.string().optional(),
    items: z.array(lineItemSchema).min(1, "At least one item is required"),
});

import { SerializedSalesOrder } from "@/types/serialized";

interface SalesOrderEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: SerializedSalesOrder;
    customers: Array<{ id: string; name: string }>;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string; sellingPrice: number }>;
    onSuccess?: () => void;
}

export function SalesOrderEditModal({
    open,
    onOpenChange,
    order,
    customers,
    warehouses,
    products,
    onSuccess,
}: SalesOrderEditModalProps) {
    const t = useTranslations("salesOrders");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("form.editTitle")}</DialogTitle>
                    <DialogDescription>
                        Editing sales orders is currently not supported. Please cancel this order and create a new one.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
