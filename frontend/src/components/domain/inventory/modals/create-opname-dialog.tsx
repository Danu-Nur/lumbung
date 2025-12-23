"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming exists
import { createOpname } from "@/lib/actions/opname";
import { toast } from '@/components/ui/sonner';



interface CreateOpnameDialogProps {
    warehouses: { id: string; name: string }[];
}

export function CreateOpnameDialog({ warehouses }: CreateOpnameDialogProps) {
    const t = useTranslations("opname.form");
    const tCommon = useTranslations("common.buttons");
    const tActions = useTranslations("common.actions");
    const tValidation = useTranslations("common.validation");
    const [open, setOpen] = useState(false);

    const formSchema = z.object({
        warehouseId: z.string().min(1, tValidation("required")),
        notes: z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            warehouseId: "",
            notes: "",
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const formData = new FormData();
            formData.append("warehouseId", values.warehouseId);
            if (values.notes) formData.append("notes", values.notes);

            const result = await createOpname(formData);

            if (result.success) {
                toast.success(tActions("createSuccess"));
                setOpen(false);
                form.reset();
            }
        } catch (error) {
            toast.error(tActions("createFailed"));
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {tCommon("add")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("createTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("createDescription")}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="warehouseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("selectWarehouse")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("selectWarehouse")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {warehouses.map((w) => (
                                                <SelectItem key={w.id} value={w.id}>
                                                    {w.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("notes")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t("notesPlaceholder")}
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? tActions("create") : tCommon("create")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
