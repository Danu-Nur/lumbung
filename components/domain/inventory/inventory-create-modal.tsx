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
import { Category } from "@prisma/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { CategoryCreateModal } from "../categories/category-create-modal";

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

interface InventoryCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    onSuccess?: () => void;
}

export function InventoryCreateModal({
    open,
    onOpenChange,
    categories,
    onSuccess,
}: InventoryCreateModalProps) {
    const router = useRouter();
    const t = useTranslations("inventory");
    const tCommon = useTranslations("common");
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            sku: "",
            barcode: "",
            categoryId: "",
            description: "",
            unit: "pcs",
            sellingPrice: 0,
            costPrice: 0,
            lowStockThreshold: 10,
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
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("form.createTitle")}</DialogTitle>
                        <DialogDescription>{t("form.createDescription")}</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.name")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("form.namePlaceholder")} {...field} />
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
                                            <FormLabel>{t("form.sku")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("form.skuPlaceholder")} {...field} />
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
                                            <FormLabel>{t("form.barcode")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("form.barcodePlaceholder")} {...field} />
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
                                            <FormLabel>{t("form.category")}</FormLabel>
                                            <div className="flex gap-2">
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    <option value="">{t("form.selectCategory")}</option>
                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setCategoryModalOpen(true)}
                                                    title={t("form.addCategory")}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
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
                                        <FormLabel>{t("form.description")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("form.descriptionPlaceholder")} {...field} />
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
                                            <FormLabel>{t("form.unit")}</FormLabel>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                            <FormLabel>{t("form.sellingPrice")}</FormLabel>
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
                                            <FormLabel>{t("form.costPrice")}</FormLabel>
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
                                        <FormLabel>{t("form.lowStockThreshold")}</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="10" {...field} />
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

            <CategoryCreateModal
                open={categoryModalOpen}
                onOpenChange={setCategoryModalOpen}
                onSuccess={(newCategory: Category) => {
                    if (newCategory) {
                        form.setValue("categoryId", newCategory.id);
                    }
                }}
            />
        </>
    );
}
