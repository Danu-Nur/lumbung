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
import { createSalesOrder } from "@/features/sales-orders/actions";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CustomerCreateModal } from "@/components/domain/customers/customer-create-modal";
import { toast } from '@/components/ui/sonner';
import { useTranslations } from "next-intl";
import { LineItemsForm } from "@/components/shared/form/line-items-form";

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

interface SalesOrderCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customers: Array<{ id: string; name: string }>;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string; sellingPrice: number }>;
    onSuccess?: () => void;
}

export function SalesOrderCreateModal({
    open,
    onOpenChange,
    customers,
    warehouses,
    products,
    onSuccess,
}: SalesOrderCreateModalProps) {
    const router = useRouter();
    const t = useTranslations("salesOrders");
    const tCommon = useTranslations("common");
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [localCustomers, setLocalCustomers] = useState(customers);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customerId: "",
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
            form.reset({
                customerId: "",
                warehouseId: "",
                notes: "",
                items: [],
            });
        }
    }, [open, form]);

    const handleCustomerCreated = (newCustomer: any) => {
        setLocalCustomers([...localCustomers, newCustomer]);
        form.setValue("customerId", newCustomer.id);
        setIsCustomerDialogOpen(false);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            if (values.customerId) formData.append("customerId", values.customerId);
            formData.append("warehouseId", values.warehouseId);
            if (values.notes) formData.append("notes", values.notes);
            formData.append("items", JSON.stringify(values.items));

            await createSalesOrder(formData);
            toast.success(tCommon("actions.createSuccess"));
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to create order:", error);
            toast.error(error.message || tCommon("actions.createError"));
        }
    };



    return (
        <>
            <CustomerCreateModal
                open={isCustomerDialogOpen}
                onOpenChange={setIsCustomerDialogOpen}
                onSuccess={handleCustomerCreated}
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
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.customer")}</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                    >
                                                        <option value="">{t("form.walkInCustomer")}</option>
                                                        {localCustomers.map((customer) => (
                                                            <option key={customer.id} value={customer.id}>
                                                                {customer.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setIsCustomerDialogOpen(true)}
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

                            <LineItemsForm
                                control={form.control}
                                name="items"
                                products={products.map(p => ({ ...p, price: Number(p.sellingPrice) }))}
                                priceFieldName="unitPrice"
                                showDiscount={true}
                            />

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
