"use client";

import { useState, useEffect } from "react";
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
import { updateCategory } from "@/features/categories/actions";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().or(z.literal("")),
});

interface CategoryEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category;
    onSuccess?: () => void;
}

export function CategoryEditModal({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryEditModalProps) {
    const router = useRouter();
    const t = useTranslations("categories");
    const tCommon = useTranslations("common");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: category.name,
            description: category.description || "",
        },
    });

    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                description: category.description || "",
            });
        }
    }, [category, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            if (values.description) formData.append("description", values.description);

            await updateCategory(category.id, formData);
            toast.success(tCommon("actions.updateSuccess"));
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to update category:", error);
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
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.description")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t("form.descriptionPlaceholder")}
                                                {...field}
                                                className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-yellow/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
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
