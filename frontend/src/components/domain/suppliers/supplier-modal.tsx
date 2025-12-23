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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createSupplier, updateSupplier } from "@/features/suppliers/actions";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/sonner';
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface SupplierModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier?: any | null; // If provided, it's Edit mode
    onSuccess?: (data?: any) => void;
}

export function SupplierModal({
    open,
    onOpenChange,
    supplier,
    onSuccess,
}: SupplierModalProps) {
    const isEdit = !!supplier;
    const router = useRouter();
    const t = useTranslations("suppliers");
    const tCommon = useTranslations("common");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            city: "",
            address: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (supplier) {
                form.reset({
                    name: supplier.name,
                    email: supplier.email || "",
                    phone: supplier.phone || "",
                    city: supplier.city || "",
                    address: supplier.address || "",
                });
            } else {
                form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    city: "",
                    address: "",
                });
            }
        }
    }, [open, supplier, form]);

    const onSubmit = async (values: FormValues) => {
        try {
            let result;
            if (isEdit && supplier) {
                result = await updateSupplier(supplier.id, values);
                toast.success(tCommon("actions.updateSuccess"));
            } else {
                result = await createSupplier(values);
                toast.success(tCommon("actions.createSuccess"));
            }

            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess(result);
        } catch (error: any) {
            const action = isEdit ? "update" : "create";
            toast.error(error.message || tCommon(`actions.${action}Error`));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-white rounded-none bg-white dark:bg-neo-dark overflow-hidden">
                <div className={cn(
                    "border-b-2 border-black dark:border-white p-3 flex justify-between items-center text-black",
                    isEdit ? "bg-neo-yellow" : "bg-neo-green"
                )}>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold uppercase">
                            {isEdit ? t("form.editTitle") : t("form.createTitle")}
                        </h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">
                            {isEdit ? t("form.editDescription") : t("form.createDescription")}
                        </span>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition-colors text-xs rounded-none">✕</button>
                </div>

                <div className="p-5 overflow-y-auto max-h-[80vh]">
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
                                                className={cn(
                                                    "w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none rounded-none dark:text-white",
                                                    isEdit ? "focus:bg-neo-yellow/5 focus:shadow-neo-yellow" : "focus:bg-neo-green/5 focus:shadow-neo-green"
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2 sm:col-span-1">
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.email")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("form.emailPlaceholder")}
                                                    {...field}
                                                    className={cn(
                                                        "w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none rounded-none dark:text-white",
                                                        isEdit ? "focus:bg-neo-yellow/5 focus:shadow-neo-yellow" : "focus:bg-neo-green/5 focus:shadow-neo-green"
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2 sm:col-span-1">
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.phone")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("form.phonePlaceholder")}
                                                    {...field}
                                                    className={cn(
                                                        "w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none rounded-none dark:text-white",
                                                        isEdit ? "focus:bg-neo-yellow/5 focus:shadow-neo-yellow" : "focus:bg-neo-green/5 focus:shadow-neo-green"
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

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
                                                className={cn(
                                                    "w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none rounded-none dark:text-white",
                                                    isEdit ? "focus:bg-neo-yellow/5 focus:shadow-neo-yellow" : "focus:bg-neo-green/5 focus:shadow-neo-green"
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                                className={cn(
                                                    "w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none rounded-none dark:text-white",
                                                    isEdit ? "focus:bg-neo-yellow/5 focus:shadow-neo-yellow" : "focus:bg-neo-green/5 focus:shadow-neo-green"
                                                )}
                                            />
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
                                    {tCommon("buttons.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className={cn(
                                        "flex-1 font-bold py-2.5 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm rounded-none uppercase tracking-widest",
                                        isEdit
                                            ? "bg-black dark:bg-white text-white dark:text-black hover:bg-neo-yellow"
                                            : "bg-black dark:bg-white text-white dark:text-black hover:bg-neo-green"
                                    )}
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
