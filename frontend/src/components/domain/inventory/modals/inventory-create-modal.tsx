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
import { createProduct } from "@/features/inventory/actions";
import { useRouter } from "next/navigation";
import { Category, Warehouse } from "@prisma/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { CategoryCreateModal } from "@/components/domain/categories/category-create-modal";
import { WarehouseModal } from "@/components/domain/warehouses/warehouse-modal";
import { SupplierModal } from "@/components/domain/suppliers/supplier-modal";

interface InventoryCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    warehouses: Warehouse[];
    suppliers?: { id: string; name: string }[];
    onSuccess?: () => void;
}

export function InventoryCreateModal({
    open,
    onOpenChange,
    categories,
    warehouses,
    suppliers = [],
    onSuccess,
}: InventoryCreateModalProps) {
    const router = useRouter();
    const t = useTranslations("inventory");
    const tCommon = useTranslations("common");
    const tValidation = useTranslations("common.validation");
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
    const [supplierModalOpen, setSupplierModalOpen] = useState(false);
    const [availableCategories, setAvailableCategories] = useState<Category[]>(categories);
    const [availableSuppliers, setAvailableSuppliers] = useState<{ id: string; name: string }[]>(suppliers);

    const formSchema = z.object({
        name: z.string().min(1, tValidation("required")),
        sku: z.string().min(1, tValidation("required")),
        barcode: z.string().optional().or(z.literal("")),
        categoryId: z.string().optional().or(z.literal("")),
        supplierId: z.string().optional().or(z.literal("")),
        description: z.string().optional().or(z.literal("")),
        unit: z.string().min(1, tValidation("required")),
        sellingPrice: z.coerce.number().min(0, tValidation("positive")),
        costPrice: z.coerce.number().min(0, tValidation("positive")),
        lowStockThreshold: z.coerce.number().min(0).default(10),
        // Initial Stock (Optional)
        initialStock: z.coerce.number().min(0).optional(),
        warehouseId: z.string().optional().or(z.literal("")),
    }).refine((data) => {
        if (data.initialStock && data.initialStock > 0 && !data.warehouseId) {
            return false;
        }
        return true;
    }, {
        message: tValidation("required"),
        path: ["warehouseId"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            sku: "",
            barcode: "",
            categoryId: "",
            supplierId: "",
            description: "",
            unit: "pcs",
            sellingPrice: 0,
            costPrice: 0,
            lowStockThreshold: 10,
            initialStock: 0,
            warehouseId: "",
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

            await createProduct(formData);
            toast.success(tCommon("actions.createSuccess"));
            form.reset();
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to create product:", error);
            toast.error(error.message || tCommon("actions.createError"));
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px] p-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-white rounded-none bg-white dark:bg-neo-dark max-h-[90vh] flex flex-col">
                    <div className="bg-neo-green border-b-2 border-black dark:border-white p-3 flex justify-between items-center text-black">
                        <div className="flex flex-col">
                            <DialogTitle className="text-lg font-bold">{t("form.createTitle")}</DialogTitle>
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{t("form.createDescription")}</span>
                        </div>
                        <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition-colors text-xs rounded-none">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.name")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t("form.namePlaceholder")} {...field} className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white" />
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
                                                <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.sku")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t("form.skuPlaceholder")} {...field} className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white" />
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
                                                <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.barcode")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t("form.barcodePlaceholder")} {...field} className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white" />
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
                                                <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.category")}</FormLabel>
                                                <div className="flex gap-2">
                                                    <select
                                                        className="flex h-10 w-full rounded-none bg-white dark:bg-gray-800 px-3 py-2 text-sm border-2 border-black dark:border-white focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white transition-all dark:text-white"
                                                        {...field}
                                                    >
                                                        <option value="">{t("form.selectCategory")}</option>
                                                        {availableCategories.map((category) => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCategoryModalOpen(true)}
                                                        className="h-10 w-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none text-black dark:text-white"
                                                        title={t("form.addCategory")}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="supplierId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.supplier") || "Preferred Supplier"}</FormLabel>
                                            <div className="flex gap-2">
                                                <select
                                                    className="flex h-10 w-full rounded-none bg-white dark:bg-gray-800 px-3 py-2 text-sm border-2 border-black dark:border-white focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white transition-all dark:text-white"
                                                    {...field}
                                                >
                                                    <option value="">{t("form.selectSupplier") || "Select Supplier"}</option>
                                                    {availableSuppliers.map((supplier) => (
                                                        <option key={supplier.id} value={supplier.id}>
                                                            {supplier.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => setSupplierModalOpen(true)}
                                                    className="h-10 w-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none text-black dark:text-white"
                                                    title={t("form.addSupplier") || "Add Supplier"}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.description")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("form.descriptionPlaceholder")} {...field} className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white" />
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
                                                <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.unit")}</FormLabel>
                                                <select
                                                    className="flex h-10 w-full rounded-none bg-white dark:bg-gray-800 px-3 py-2 text-sm border-2 border-black dark:border-white focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white transition-all dark:text-white"
                                                    {...field}
                                                >
                                                    <option value="pcs">{t("units.pcs")}</option>
                                                    <option value="box">{t("units.box")}</option>
                                                    <option value="kg">{t("units.kg")}</option>
                                                    <option value="liter">{t("units.liter")}</option>
                                                    <option value="meter">{t("units.meter")}</option>
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
                                                <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.sellingPrice")}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white" />
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
                                                <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.costPrice")}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white" />
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
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.lowStockThreshold")}</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="10" {...field} className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="border-t-2 border-black border-dashed pt-4 mt-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 inline-block mb-3">{t("form.initialStockTitle") || "Initial Stock"}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="warehouseId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.warehouse") || "Warehouse"}</FormLabel>
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="flex h-10 w-full rounded-none bg-white dark:bg-gray-800 px-3 py-2 text-sm border-2 border-black dark:border-white focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white transition-all dark:text-white"
                                                            {...field}
                                                        >
                                                            <option value="">{t("form.selectWarehouse") || "Select Warehouse"}</option>
                                                            {warehouses.map((warehouse) => (
                                                                <option key={warehouse.id} value={warehouse.id}>
                                                                    {warehouse.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={() => setWarehouseModalOpen(true)}
                                                            className="h-10 w-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none text-black dark:text-white"
                                                            title={t("form.addWarehouse") || "Add Warehouse"}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="initialStock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider">{t("form.quantity") || "Quantity"}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white rounded-none dark:text-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>

                    <div className="p-5 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900 flex gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 bg-white dark:bg-gray-800 text-black dark:text-white font-bold py-2.5 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm rounded-none uppercase tracking-widest"
                        >
                            {tCommon("actions.cancel")}
                        </button>
                        <button
                            type="submit"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={form.formState.isSubmitting}
                            className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-2.5 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-neo-green hover:text-black transition-all text-sm rounded-none uppercase tracking-widest"
                        >
                            {form.formState.isSubmitting ? tCommon("actions.saving") : tCommon("buttons.save")}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <CategoryCreateModal
                open={categoryModalOpen}
                onOpenChange={setCategoryModalOpen}
                onSuccess={(newCategory: Category) => {
                    if (newCategory) {
                        setAvailableCategories((prev) => [...prev, newCategory]);
                        form.setValue("categoryId", newCategory.id);
                        router.refresh();
                    }
                }}
            />

            <WarehouseModal
                open={warehouseModalOpen}
                onOpenChange={setWarehouseModalOpen}
                onSuccess={() => {
                    router.refresh();
                }}
            />

            <SupplierModal
                open={supplierModalOpen}
                onOpenChange={setSupplierModalOpen}
                onSuccess={(newSupplier: any) => {
                    if (newSupplier) {
                        setAvailableSuppliers((prev) => [...prev, { id: newSupplier.id, name: newSupplier.name }]);
                        form.setValue("supplierId", newSupplier.id);
                        router.refresh();
                    }
                }}
            />
        </>
    );
}
