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
import { createPurchaseOrder } from "@/features/purchase-orders/actions";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { SupplierCreateModal } from "@/components/domain/suppliers/supplier-create-modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const lineItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    productName: z.string(),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitCost: z.coerce.number().min(0),
});

const formSchema = z.object({
    supplierId: z.string().min(1, "Supplier is required"),
    warehouseId: z.string().min(1, "Warehouse is required"),
    notes: z.string().optional(),
    items: z.array(lineItemSchema).min(1, "At least one item is required"),
});

interface PurchaseOrderCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suppliers: Array<{ id: string; name: string }>;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string; costPrice: number }>;
    onSuccess?: () => void;
}

export function PurchaseOrderCreateModal({
    open,
    onOpenChange,
    suppliers,
    warehouses,
    products,
    onSuccess,
}: PurchaseOrderCreateModalProps) {
    const router = useRouter();
    const t = useTranslations("purchaseOrders");
    const tCommon = useTranslations("common");
    const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
    const [localSuppliers, setLocalSuppliers] = useState(suppliers);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            supplierId: "",
            warehouseId: "",
            notes: "",
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        if (open) {
            form.reset({
                supplierId: "",
                warehouseId: "",
                notes: "",
                items: [],
            });
        }
    }, [open, form]);

    const handleSupplierCreated = (newSupplier: any) => {
        setLocalSuppliers([...localSuppliers, newSupplier]);
        form.setValue("supplierId", newSupplier.id);
        setIsSupplierDialogOpen(false);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            formData.append("supplierId", values.supplierId);
            formData.append("warehouseId", values.warehouseId);
            if (values.notes) formData.append("notes", values.notes);
            formData.append("items", JSON.stringify(values.items));

            await createPurchaseOrder(formData);
            toast.success(tCommon("actions.createSuccess"));
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to create order:", error);
            toast.error(error.message || tCommon("actions.createError"));
        }
    };

    const handleAddItem = (productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            append({
                productId: product.id,
                productName: product.name,
                quantity: 1,
                unitCost: Number(product.costPrice),
            });
        }
    };

    const currentItems = form.watch("items");
    const total = currentItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    return (
        <>
            <SupplierCreateModal
                open={isSupplierDialogOpen}
                onOpenChange={setIsSupplierDialogOpen}
                onSuccess={handleSupplierCreated}
            />
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("form.createTitle")}</DialogTitle>
                        <DialogDescription>{t("form.createDescription")}</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="supplierId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.supplier")}</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                    >
                                                        <option value="">{t("form.selectSupplier")}</option>
                                                        {localSuppliers.map((supplier) => (
                                                            <option key={supplier.id} value={supplier.id}>
                                                                {supplier.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setIsSupplierDialogOpen(true)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="warehouseId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.warehouse")}</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    <option value="">{t("form.selectWarehouse")}</option>
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

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">{t("form.lineItems")}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleAddItem(e.target.value);
                                                    e.target.value = "";
                                                }
                                            }}
                                        >
                                            <option value="">{t("form.selectProduct")}</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} ({product.sku}) - {formatCurrency(Number(product.costPrice))}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {fields.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">
                                            {t("form.noItems")}
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2 items-center p-3 bg-muted/50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{field.productName}</p>
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        className="w-20 h-8"
                                                                        min="1"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.unitCost`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        className="w-28 h-8"
                                                                        step="0.01"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>{t("form.total")}:</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    {tCommon("buttons.cancel")}
                                </Button>
                                <Button type="submit" disabled={fields.length === 0 || form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? tCommon("actions.saving") : tCommon("buttons.create")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
