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
import { createWarehouse } from "@/features/warehouses/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
});

interface WarehouseCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function WarehouseCreateModal({
    open,
    onOpenChange,
    onSuccess,
}: WarehouseCreateModalProps) {
    const router = useRouter();
    const t = useTranslations("warehouses");
    const tCommon = useTranslations("common");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            address: "",
            city: "",
            phone: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createWarehouse({
                name: values.name,
                code: values.code,
                address: values.address || undefined,
                city: values.city || undefined,
                phone: values.phone || undefined,
            });
            toast.success(tCommon("actions.createSuccess"));
            form.reset();
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to create warehouse:", error);
            toast.error(error.message || tCommon("actions.createError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("form.createTitle")}</DialogTitle>
                    <DialogDescription>{t("form.createDescription")}</DialogDescription>
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

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form.code")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("form.codePlaceholder")} {...field} />
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
                                        <FormLabel>{t("form.phone")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("form.phonePlaceholder")} {...field} />
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
