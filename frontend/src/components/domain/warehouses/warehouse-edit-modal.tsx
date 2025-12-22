"use client";

import { useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { updateWarehouse } from "@/features/warehouses/actions";
import { useRouter } from "next/navigation";
import { Warehouse } from "@prisma/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
});

interface WarehouseEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouse: Warehouse;
    onSuccess?: () => void;
}

export function WarehouseEditModal({
    open,
    onOpenChange,
    warehouse,
    onSuccess,
}: WarehouseEditModalProps) {
    const router = useRouter();
    const t = useTranslations("warehouses");
    const tCommon = useTranslations("common");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: warehouse.name,
            code: warehouse.code,
            address: warehouse.address || "",
            city: warehouse.city || "",
            phone: warehouse.phone || "",
            isActive: warehouse.isActive,
        },
    });

    useEffect(() => {
        if (warehouse) {
            form.reset({
                name: warehouse.name,
                code: warehouse.code,
                address: warehouse.address || "",
                city: warehouse.city || "",
                phone: warehouse.phone || "",
                isActive: warehouse.isActive,
            });
        }
    }, [warehouse, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await updateWarehouse(warehouse.id, {
                name: values.name,
                code: values.code,
                address: values.address || undefined,
                city: values.city || undefined,
                phone: values.phone || undefined,
                isActive: values.isActive,
            });
            toast.success(tCommon("actions.updateSuccess"));
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to update warehouse:", error);
            toast.error(error.message || tCommon("actions.updateError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-white rounded-none bg-white dark:bg-neo-dark overflow-hidden">
                <div className="bg-neo-yellow border-b-2 border-black dark:border-white p-3 flex justify-between items-center text-black">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold uppercase">{t("form.editTitle")}</h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{t("form.editDescription")}</span>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-6 h-6 bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white border border-black dark:border-white flex items-center justify-center transition-colors text-xs rounded-none shadow-neo-hover dark:shadow-neo-hover-white hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.name")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t("form.namePlaceholder")}
                                                {...field}
                                                className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-yellow/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.code")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t("form.codePlaceholder")}
                                                {...field}
                                                className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-yellow/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.phone")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("form.phonePlaceholder")}
                                                    {...field}
                                                    className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-yellow/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.city")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("form.cityPlaceholder")}
                                                    {...field}
                                                    className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-yellow/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.address")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t("form.addressPlaceholder")}
                                                {...field}
                                                className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-yellow/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-800 rounded-none transition-colors">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="w-5 h-5 border-2 border-black dark:border-white rounded-none data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:text-white dark:data-[state=checked]:text-black"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-black text-[10px] uppercase tracking-wider cursor-pointer dark:text-white">
                                                {t("form.isActive")}
                                            </FormLabel>
                                        </div>
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
                                    className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-2.5 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-neo-yellow dark:hover:bg-neo-yellow hover:text-black transition-all text-sm rounded-none uppercase tracking-widest"
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
