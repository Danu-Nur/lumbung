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
import { CrudModal } from "@/components/common/CrudModal";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Package, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createPurchaseOrder, receivePurchaseOrder, updatePurchaseOrderStatus } from "@/features/purchase-orders/actions";
import { SupplierCreateModal } from "@/components/domain/suppliers/supplier-create-modal";
import Link from "next/link";

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

interface PurchaseOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order?: any; // PurchaseOrder with relations
    suppliers: Array<{ id: string; name: string }>;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string; costPrice: number }>;
    onSuccess?: () => void;
}

export function PurchaseOrderDialog({
    open,
    onOpenChange,
    order,
    suppliers,
    warehouses,
    products,
    onSuccess,
}: PurchaseOrderDialogProps) {
    const router = useRouter();
    const isView = !!order;
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
        if (open && !isView) {
            form.reset({
                supplierId: "",
                warehouseId: "",
                notes: "",
                items: [],
            });
        }
    }, [open, isView, form]);

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

            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to create order:", error);
            alert(error.message || "Failed to create order");
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

    const renderViewContent = () => {
        if (!order) return null;

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{order.poNumber}</h2>
                        <p className="text-muted-foreground">{formatDate(order.orderDate)}</p>
                    </div>
                    <div className="flex space-x-2">
                        {order.status === 'DRAFT' && (
                            <form action={async () => { await updatePurchaseOrderStatus(order.id, 'SENT'); onSuccess?.(); }}>
                                <Button type="submit" size="sm">
                                    <Package className="w-4 h-4 mr-2" />
                                    Send Order
                                </Button>
                            </form>
                        )}
                        {order.status === 'SENT' && (
                            <form action={async () => { await receivePurchaseOrder(order.id); onSuccess?.(); }}>
                                <Button type="submit" size="sm">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Receive Items
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Supplier</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{order.supplier?.name}</p>
                            <p className="text-sm text-muted-foreground">{order.supplier?.email}</p>
                            <p className="text-sm text-muted-foreground">{order.supplier?.phone}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Warehouse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{order.warehouse?.name}</p>
                            <p className="text-sm text-muted-foreground">{order.warehouse?.code}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Product</th>
                                        <th className="text-right py-2">Qty</th>
                                        <th className="text-right py-2">Cost</th>
                                        <th className="text-right py-2">Total</th>
                                        <th className="text-right py-2">Received</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item: any) => (
                                        <tr key={item.id} className="border-b last:border-0">
                                            <td className="py-2">
                                                <p className="font-medium">{item.product.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                                            </td>
                                            <td className="text-right py-2">{item.quantity}</td>
                                            <td className="text-right py-2">{formatCurrency(Number(item.unitCost))}</td>
                                            <td className="text-right py-2 font-medium">{formatCurrency(Number(item.lineTotal))}</td>
                                            <td className="text-right py-2">
                                                {item.receivedQty}/{item.quantity}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(Number(order.total))}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {order.notes && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{order.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    const renderCreateContent = () => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier</FormLabel>
                                <div className="flex gap-2">
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            {...field}
                                        >
                                            <option value="">Select supplier</option>
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
                                <FormLabel>Warehouse</FormLabel>
                                <FormControl>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                    >
                                        <option value="">Select warehouse</option>
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
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Input placeholder="Order notes..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Line Items</CardTitle>
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
                                <option value="">Select product to add...</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} ({product.sku}) - {formatCurrency(Number(product.costPrice))}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {fields.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                No items added yet
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
                                <span>Total:</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={fields.length === 0}>
                        Create Order
                    </Button>
                </div>
            </form>
        </Form>
    );

    return (
        <>
            <SupplierCreateModal
                open={isSupplierDialogOpen}
                onOpenChange={setIsSupplierDialogOpen}
                onSuccess={handleSupplierCreated}
            />
            <CrudModal
                open={open}
                onOpenChange={onOpenChange}
                title={isView ? "Purchase Order Details" : "New Purchase Order"}
                description={isView ? "View order details and status." : "Create a new purchase order."}
                className="sm:max-w-[900px]"
            >
                {isView ? renderViewContent() : renderCreateContent()}
            </CrudModal>
        </>
    );
}
