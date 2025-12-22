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
import { LineItemsForm } from "@/components/shared/form/line-items-form";
import { WarehouseModal } from "@/components/domain/warehouses/warehouse-modal";

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
    products: Array<{ id: string; name: string; sku: string; costPrice: number; supplierId?: string | null }>;
    onSuccess?: () => void;
    initialProductId?: string;
}

export function PurchaseOrderCreateModal({
    open,
    onOpenChange,
    suppliers,
    warehouses,
    products,
    onSuccess,
    initialProductId,
}: PurchaseOrderCreateModalProps) {
    const router = useRouter();
    const t = useTranslations("purchases");
    const tCommon = useTranslations("common");
    const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
    const [createWarehouseOpen, setCreateWarehouseOpen] = useState(false);
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

    const { fields } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        if (open) {
            const initialItems: any[] = [];
            let initialSupplierId = "";

            if (initialProductId) {
                const product = products.find(p => p.id === initialProductId);
                if (product) {
                    initialItems.push({
                        productId: product.id,
                        productName: product.name,
                        quantity: 1,
                        unitCost: Number(product.costPrice),
                    });
                    if (product.supplierId) {
                        initialSupplierId = product.supplierId;
                    }
                }
            }

            form.reset({
                supplierId: initialSupplierId,
                warehouseId: warehouses.length > 0 ? warehouses[0].id : "",
                notes: "",
                items: initialItems,
            });
        }
    }, [open, form, initialProductId, products, warehouses]);

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

    const handleCreateWarehouseSuccess = () => {
        setCreateWarehouseOpen(false);
        router.refresh();
    };

    return (
        <>
            <SupplierCreateModal
                open={isSupplierDialogOpen}
                onOpenChange={setIsSupplierDialogOpen}
                onSuccess={handleSupplierCreated}
            />
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[900px] p-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-white rounded-none bg-white dark:bg-neo-dark max-h-[90vh] flex flex-col">
                    <div className="bg-neo-blue border-b-2 border-black dark:border-white p-3 flex justify-between items-center text-white">
                        <div className="flex flex-col">
                            <DialogTitle className="text-lg font-bold">{t("form.createTitle")}</DialogTitle>
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{t("form.createDescription")}</span>
                        </div>
                        <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition-colors text-xs rounded-none">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="supplierId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold dark:text-white uppercase text-xs tracking-wider">{t("form.supplier")}</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <select
                                                            className="flex h-12 w-full rounded-none bg-white dark:bg-gray-800 px-3 py-2 text-sm border-2 border-black dark:border-white focus:outline-none focus:bg-neo-blue/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white transition-all dark:text-white font-medium"
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
                                                        className="h-12 w-12 shrink-0 border-2 border-black dark:border-white rounded-none shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all bg-neo-yellow text-black"
                                                        onClick={() => setIsSupplierDialogOpen(true)}
                                                    >
                                                        <Plus className="w-5 h-5" />
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
                                                <FormLabel className="font-bold dark:text-white uppercase text-xs tracking-wider">{t("form.warehouse")}</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <select
                                                            className="flex h-12 w-full rounded-none bg-white dark:bg-gray-800 px-3 py-2 text-sm border-2 border-black dark:border-white focus:outline-none focus:bg-neo-blue/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white transition-all dark:text-white font-medium"
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
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-12 w-12 shrink-0 border-2 border-black dark:border-white rounded-none shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all bg-neo-yellow text-black"
                                                        onClick={() => setCreateWarehouseOpen(true)}
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <WarehouseModal
                                    open={createWarehouseOpen}
                                    onOpenChange={setCreateWarehouseOpen}
                                    onSuccess={handleCreateWarehouseSuccess}
                                />

                                {initialProductId && fields.length > 0 ? (
                                    <div className="border-2 border-black dark:border-white p-4 space-y-4 bg-neo-blue/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-neo-blue tracking-tighter mb-1">Items To Purchase</span>
                                            <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">{fields[0].productName}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`items.0.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-bold dark:text-white uppercase text-xs">Quantity</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                className="h-12 text-lg font-black bg-white dark:bg-gray-800 border-2 border-black dark:border-white rounded-none focus:shadow-neo-sm dark:focus:shadow-neo-sm-white transition-all"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormItem>
                                                <FormLabel className="font-bold dark:text-white uppercase text-xs">Unit Cost (Est.)</FormLabel>
                                                <div className="h-12 flex items-center px-3 border-2 border-dashed border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 font-bold dark:text-white text-lg">
                                                    {formatCurrency(fields[0].unitCost)}
                                                </div>
                                            </FormItem>
                                        </div>
                                    </div>
                                ) : (
                                    <LineItemsForm
                                        control={form.control}
                                        name="items"
                                        products={products.map(p => ({ ...p, price: Number(p.costPrice) })) as any}
                                        priceFieldName="unitCost"
                                        showDiscount={false}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold dark:text-white uppercase text-xs tracking-wider">{t("form.notes")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("form.notesPlaceholder")}
                                                    {...field}
                                                    className="w-full h-12 bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-blue/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white font-medium"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </form>
                        </Form>
                    </div>

                    <div className="p-5 border-t-2 border-black dark:border-white bg-white dark:bg-neo-dark flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-2 px-2">
                            <span className="font-black uppercase text-sm tracking-widest opacity-60 dark:text-white">{tCommon("table.total")}</span>
                            <span className="text-2xl font-black text-neo-blue dark:text-neo-yellow underline decoration-black dark:decoration-white decoration-4 underline-offset-4">
                                {formatCurrency(
                                    form.watch("items")?.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitCost)), 0) || 0
                                )}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="flex-1 bg-white dark:bg-gray-800 text-black dark:text-white font-black py-4 border-4 border-black dark:border-white shadow-neo dark:shadow-neo-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm rounded-none uppercase tracking-widest"
                            >
                                {tCommon("actions.cancel")}
                            </button>
                            <button
                                type="submit"
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={fields.length === 0 || form.formState.isSubmitting}
                                className="flex-1 bg-neo-yellow text-black font-black py-4 border-4 border-black dark:border-white shadow-neo dark:shadow-neo-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-black hover:text-white transition-all text-sm rounded-none uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
                            >
                                {form.formState.isSubmitting ? tCommon("actions.saving") : tCommon("buttons.create")}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <WarehouseModal
                open={createWarehouseOpen}
                onOpenChange={setCreateWarehouseOpen}
                onSuccess={handleCreateWarehouseSuccess}
            />
        </>
    );
}
