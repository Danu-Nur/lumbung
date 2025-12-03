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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { updateSupplier } from "@/features/suppliers/actions";
import { useRouter } from "next/navigation";
import { Supplier } from "@prisma/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
});

interface SupplierEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier;
    onSuccess?: () => void;
}

export function SupplierEditModal({
    open,
    onOpenChange,
    supplier,
    onSuccess,
}: SupplierEditModalProps) {
    const router = useRouter();
    const t = useTranslations("suppliers");
    const tCommon = useTranslations("common");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: supplier.name,
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
            city: supplier.city || "",
        },
    });

    useEffect(() => {
        if (supplier) {
            form.reset({
                name: supplier.name,
                email: supplier.email || "",
                phone: supplier.phone || "",
                address: supplier.address || "",
                city: supplier.city || "",
            });
        }
    }, [supplier, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await updateSupplier(supplier.id, {
                name: values.name,
                email: values.email || undefined,
                phone: values.phone || undefined,
                address: values.address || undefined,
                city: values.city || undefined,
            });
            toast.success(tCommon("actions.updateSuccess"));
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to update supplier:", error);
            toast.error(error.message || tCommon("actions.updateError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("form.editTitle")}</DialogTitle>
                    <DialogDescription>{t("form.editDescription")}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form.email")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("form.emailPlaceholder")} {...field} />
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
                                        <FormLabel>{t("form.phone")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("form.phonePlaceholder")} {...field} />
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
                                    <FormLabel>{t("form.address")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("form.addressPlaceholder")} {...field} />
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
                                    <FormLabel>{t("form.city")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("form.cityPlaceholder")} {...field} />
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
    );
}
