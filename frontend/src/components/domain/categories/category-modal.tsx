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
import { createCategory, updateCategory } from "@/features/categories/actions";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/sonner';
import { useTranslations } from "next-intl";
import { Category } from "@prisma/client";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().or(z.literal("")),
});

interface CategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null; // If provided, it's Edit mode
    onSuccess?: (data?: any) => void;
}

export function CategoryModal({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryModalProps) {
    const isEdit = !!category;
    const router = useRouter();
    const t = useTranslations("categories");
    const tCommon = useTranslations("common");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (category) {
                form.reset({
                    name: category.name,
                    description: category.description || "",
                });
            } else {
                form.reset({
                    name: "",
                    description: "",
                });
            }
        }
    }, [open, category, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            if (values.description) formData.append("description", values.description);

            let result;
            if (isEdit && category) {
                result = await updateCategory(category.id, formData);
                toast.success(tCommon("actions.updateSuccess"));
            } else {
                result = await createCategory(formData);
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
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.description")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t("form.descriptionPlaceholder")}
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
