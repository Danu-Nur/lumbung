"use client";

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
import { createSupplier } from "@/features/suppliers/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
});

interface SupplierCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (supplier: any) => void;
}

export function SupplierCreateModal({
    open,
    onOpenChange,
    onSuccess,
}: SupplierCreateModalProps) {
    const router = useRouter();
    const t = useTranslations("suppliers");
    const tCommon = useTranslations("common");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const result = await createSupplier({
                name: values.name,
                email: values.email || undefined,
                phone: values.phone || undefined,
                address: values.address || undefined,
                city: values.city || undefined,
            });
            toast.success(tCommon("actions.createSuccess"));
            form.reset();
            form.reset();
            if (onSuccess) onSuccess(result);
        } catch (error: any) {
            console.error("Failed to create supplier:", error);
            toast.error(error.message || tCommon("actions.createError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-white rounded-none bg-white dark:bg-neo-dark overflow-hidden">
                <div className="bg-neo-green border-b-2 border-black dark:border-white p-3 flex justify-between items-center text-black">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold uppercase">{t("form.createTitle")}</h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{t("form.createDescription")}</span>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-6 h-6 bg-white dark:bg-white text-black border border-black dark:border-white flex items-center justify-center transition-colors text-xs rounded-none shadow-neo-hover dark:shadow-neo-hover-white hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
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
                                                className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
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
                                        <FormItem>
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.email")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("form.emailPlaceholder")}
                                                    {...field}
                                                    className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
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
                                        <FormItem>
                                            <FormLabel className="block font-black text-[10px] mb-1 uppercase tracking-wider dark:text-white">{t("form.phone")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("form.phonePlaceholder")}
                                                    {...field}
                                                    className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
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
                                                className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
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
                                                className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm focus:outline-none focus:bg-neo-green/5 focus:shadow-neo-sm dark:focus:shadow-neo-sm-white dark:text-white rounded-none"
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
                                    className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-2.5 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-neo-green dark:hover:bg-neo-green hover:text-black transition-all text-sm rounded-none uppercase tracking-widest"
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
