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
            <DialogContent className="sm:max-w-[500px] p-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-white rounded-none bg-white dark:bg-neo-dark">
                <div className="bg-neo-yellow border-b-2 border-black dark:border-white p-3 flex justify-between items-center text-black">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">{t("stock.manageStock")}</h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{product.sku}</span>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-white dark:bg-black border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition-colors text-xs rounded-none text-black dark:text-white">✕</button>
                </div>

                <div className="p-5">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="warehouseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("stock.warehouse")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white">
                                                    <SelectValue placeholder={t("stock.selectWarehouse")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-neo-sm dark:shadow-neo-sm-white bg-white dark:bg-gray-800 dark:text-white">
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
                                <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none text-xs font-black uppercase flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t("stock.currentStock")}</span>
                                    <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-none">{currentStock} {product.unit}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("stock.action")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-neo-sm dark:shadow-neo-sm-white bg-white dark:bg-gray-800 dark:text-white">
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
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("stock.quantity")}</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" {...field} className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-yellow/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white" />
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
                                        <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("stock.reason")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white">
                                                    <SelectValue placeholder={t("stock.selectReason")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-neo-sm dark:shadow-neo-sm-white bg-white dark:bg-gray-800 dark:text-white">
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
                                        <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("stock.notes")}</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder={t("stock.notesPlaceholder")} {...field} className="w-full bg-white border-2 border-black p-2 text-sm focus:outline-none focus:bg-neo-yellow/5 focus:shadow-neo-sm rounded-none min-h-[80px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-3 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1 bg-white dark:bg-gray-800 text-black dark:text-white font-bold py-2.5 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm rounded-none uppercase tracking-widest"
                                >
                                    {tCommon("actions.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-2.5 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-neo-yellow hover:text-black transition-all text-sm rounded-none uppercase tracking-widest"
                                >
                                    {form.formState.isSubmitting ? tCommon("actions.saving") : tCommon("buttons.save")}
                                </button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
