"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createProduct, updateProduct } from "@/features/inventory/actions";
import { DialogForm } from "@/components/shared/dialog-form";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Category, Product, InventoryItem, Warehouse } from "@prisma/client";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    barcode: z.string().optional().or(z.literal("")),
    categoryId: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    unit: z.string().min(1, "Unit is required"),
    sellingPrice: z.coerce.number().min(0, "Selling price must be positive"),
    costPrice: z.coerce.number().min(0, "Cost price must be positive"),
    lowStockThreshold: z.coerce.number().min(0).default(10),
});

type ProductWithRelations = Product & {
    category: Category | null;
    inventoryItems: (InventoryItem & { warehouse: Warehouse })[];
};

interface InventoryDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    product?: ProductWithRelations;
    categories: Category[];
    onSuccess?: (product?: any) => void;
}

export function InventoryDialog({
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    product,
    categories,
    onSuccess,
}: InventoryDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const router = useRouter();
    const isEdit = !!product;

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: product?.name || "",
            sku: product?.sku || "",
            barcode: product?.barcode || "",
            categoryId: product?.categoryId || "",
            description: product?.description || "",
            unit: product?.unit || "pcs",
            sellingPrice: product ? Number(product.sellingPrice) : 0,
            costPrice: product ? Number(product.costPrice) : 0,
            lowStockThreshold: product?.lowStockThreshold || 10,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            let result;
            if (isEdit) {
                result = await updateProduct(product.id, formData);
            } else {
                result = await createProduct(formData);
            }

            form.reset();
            setOpen(false);
            router.refresh();
            if (onSuccess) onSuccess(result);
        } catch (error: any) {
            console.error("Failed to save product:", error);
            alert(error.message || "Failed to save product");
        }
    };

    const totalStock = product?.inventoryItems.reduce(
        (sum, item) => sum + item.quantityOnHand,
        0
    ) || 0;

    const content = (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Laptop Dell XPS 13" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., ELEC-LAP-001" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Barcode</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 1234567890123" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Input placeholder="Product description" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                            >
                                <option value="pcs">Pieces (pcs)</option>
                                <option value="box">Box</option>
                                <option value="kg">Kilogram (kg)</option>
                                <option value="liter">Liter</option>
                                <option value="meter">Meter</option>
                            </select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Selling Price</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cost Price</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Low Stock Threshold</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );

    return (
        <DialogForm
            trigger={trigger}
            open={open}
            onOpenChange={setOpen}
            title={isEdit ? "Edit Product" : "Add Product"}
            description={isEdit ? "Update product details." : "Create a new product in your inventory."}
            form={form}
            onSubmit={onSubmit}
            submitLabel={isEdit ? "Save Changes" : "Create Product"}

        >
            {isEdit && product ? (
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="stock">Stock</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="mt-4">
                        {content}
                    </TabsContent>
                    <TabsContent value="stock" className="mt-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalStock} {product.unit}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Allocated</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {product.inventoryItems.reduce((sum, item) => sum + item.allocatedQty, 0)} {product.unit}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Available</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-600">
                                        {product.inventoryItems.reduce((sum, item) => sum + item.availableQty, 0)} {product.unit}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Stock by Warehouse</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {product.inventoryItems.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No stock in any warehouse
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {product.inventoryItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                            >
                                                <p className="font-medium">
                                                    {item.warehouse.name}
                                                </p>
                                                <p className="font-bold text-primary">
                                                    {item.quantityOnHand} {product.unit}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                content
            )}
        </DialogForm>
    );
}
