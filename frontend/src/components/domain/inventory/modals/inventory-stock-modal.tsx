"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { createStockAdjustment } from "@/features/inventory/actions";
import { useRouter } from "next/navigation";
import { InventoryItem, Warehouse } from "@prisma/client";
import { SerializedProduct } from "@/types/serialized";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface InventoryStockModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: SerializedProduct;
    warehouses: Warehouse[];
    onSuccess?: () => void;
}

export function InventoryStockModal({
    open,
    onOpenChange,
    product,
    warehouses,
    onSuccess,
}: InventoryStockModalProps) {
    const t = useTranslations("inventory");
    const tCommon = useTranslations("common");
    const tValidation = useTranslations("common.validation");
    const router = useRouter();

    const formSchema = z.object({
        warehouseId: z.string().min(1, tValidation("required")),
        type: z.enum(["increase", "decrease"]),
        quantity: z.coerce.number().min(1, tValidation("min", { min: 1 })),
        reason: z.string().min(1, tValidation("required")),
        notes: z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            type: "increase",
            quantity: 1,
            reason: "CORRECTION",
            notes: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createStockAdjustment({
                productId: product.id,
                warehouseId: values.warehouseId,
                type: values.type,
                quantity: values.quantity,
                reason: values.reason,
                notes: values.notes,
            });
            toast.success(tCommon("actions.updateSuccess"));
            onOpenChange(false);
            form.reset();
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to update stock:", error);
            toast.error(error.message || tCommon("actions.updateError"));
        }
    };

    const selectedWarehouseId = form.watch("warehouseId");
    const currentStock = product.inventoryItems.find(
        (item) => item.warehouseId === selectedWarehouseId
    )?.quantityOnHand || 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("stock.manageStock")}</DialogTitle>
                    <DialogDescription>{product.name} ({product.sku})</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="warehouseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("stock.warehouse")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("stock.selectWarehouse")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {selectedWarehouseId && (
                            <div className="p-3 bg-muted rounded-md text-sm">
                                <span className="font-medium">{t("stock.currentStock")}: </span>
                                {currentStock} {product.unit}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("stock.action")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="increase">{t("stock.addStock")}</SelectItem>
                                                <SelectItem value="decrease">{t("stock.removeStock")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("stock.quantity")}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("stock.reason")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("stock.selectReason")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CORRECTION">{t("reasons.correction")}</SelectItem>
                                            <SelectItem value="DAMAGE">{t("reasons.damage")}</SelectItem>
                                            <SelectItem value="LOST">{t("reasons.lost")}</SelectItem>
                                            <SelectItem value="FOUND">{t("reasons.found")}</SelectItem>
                                            <SelectItem value="AUDIT">{t("reasons.audit")}</SelectItem>
                                            <SelectItem value="EXPIRED">{t("reasons.expired")}</SelectItem>
                                            <SelectItem value="OTHER">{t("reasons.other")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("stock.notes")}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t("stock.notesPlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {tCommon("actions.cancel")}
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? tCommon("actions.saving") : tCommon("buttons.save")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
