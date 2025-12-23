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
import { createTransfer } from "@/features/transfers/actions";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/components/ui/sonner';
import { useTranslations } from "next-intl";
import { LineItemsForm } from "@/components/shared/form/line-items-form";

interface TransferCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string }>;
    onSuccess?: () => void;
}

export function TransferCreateModal({
    open,
    onOpenChange,
    warehouses,
    products,
    onSuccess,
}: TransferCreateModalProps) {
    const router = useRouter();
    const t = useTranslations("transfers");
    const tCommon = useTranslations("common");
    const tValidation = useTranslations("common.validation");

    const lineItemSchema = z.object({
        productId: z.string().min(1, tValidation("required")),
        productName: z.string(),
        quantity: z.coerce.number().min(1, tValidation("min", { min: 1 })),
    });

    const formSchema = z.object({
        fromWarehouseId: z.string().min(1, tValidation("required")),
        toWarehouseId: z.string().min(1, tValidation("required")),
        notes: z.string().optional(),
        items: z.array(lineItemSchema).min(1, tValidation("required")),
    }).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
        message: tValidation("sameWarehouseError"),
        path: ["toWarehouseId"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            fromWarehouseId: "",
            toWarehouseId: "",
            notes: "",
            items: [],
        },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        if (open) {
            form.reset({
                fromWarehouseId: "",
                toWarehouseId: "",
                notes: "",
                items: [],
            });
        }
    }, [open, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            formData.append("fromWarehouseId", values.fromWarehouseId);
            formData.append("toWarehouseId", values.toWarehouseId);
            if (values.notes) formData.append("notes", values.notes);
            formData.append("items", JSON.stringify(values.items));

            await createTransfer(formData);
            toast.success(tCommon("actions.createSuccess"));
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to create transfer:", error);
            toast.error(error.message || tCommon("actions.createError"));
        }
    };



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("form.createTitle")}</DialogTitle>
                    <DialogDescription>{t("form.createDescription")}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="fromWarehouseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form.fromWarehouse")}</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="">{t("form.selectSource")}</option>
                                                {warehouses.map((warehouse) => (
                                                    <option key={warehouse.id} value={warehouse.id}>
                                                        {warehouse.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="toWarehouseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form.toWarehouse")}</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="">{t("form.selectDestination")}</option>
                                                {warehouses.map((warehouse) => (
                                                    <option key={warehouse.id} value={warehouse.id}>
                                                        {warehouse.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form.notes")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("form.notesPlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <LineItemsForm
                            control={form.control}
                            name="items"
                            products={products.map(p => ({ ...p, price: 0 }))}
                            hidePrice={true}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {tCommon("actions.cancel")}
                            </Button>
                            <Button type="submit" disabled={fields.length === 0 || form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? tCommon("actions.saving") : tCommon("actions.create")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
