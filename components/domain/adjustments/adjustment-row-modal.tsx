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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { createStockAdjustment, getStockHistory } from "@/features/adjustments/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { adjustmentFormSchema, AdjustmentFormValues } from "@/lib/validations/adjustment";
import { SerializedProduct } from "@/types/serialized";
import { Badge } from "@/components/ui/badge";

interface AdjustmentRowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: SerializedProduct;
    warehouses: Array<{ id: string; name: string }>;
}

export function AdjustmentRowModal({
    open,
    onOpenChange,
    product,
    warehouses,
}: AdjustmentRowModalProps) {
    const router = useRouter();
    const t = useTranslations("adjustments");
    const tCommon = useTranslations("common");
    const tValidation = useTranslations("common.validation");
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const formSchema = z.object({
        productId: z.string().min(1, tValidation("required")),
        warehouseId: z.string().min(1, tValidation("required")),
        adjustmentType: z.enum(["increase", "decrease"]),
        quantity: z.coerce.number().min(1, tValidation("min", { min: 1 })),
        reason: z.string().min(1, tValidation("required")),
        notes: z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            productId: product.id,
            warehouseId: warehouses.length === 1 ? warehouses[0].id : "",
            adjustmentType: "increase",
            quantity: 1,
            reason: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                productId: product.id,
                warehouseId: warehouses.length === 1 ? warehouses[0].id : "",
                adjustmentType: "increase",
                quantity: 1,
                reason: "",
                notes: "",
            });
            fetchHistory();
        }
    }, [open, product.id, warehouses, form]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await getStockHistory(product.id);
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            formData.append("productId", values.productId);
            formData.append("warehouseId", values.warehouseId);
            formData.append("adjustmentType", values.adjustmentType);
            formData.append("quantity", values.quantity.toString());
            formData.append("reason", values.reason);
            if (values.notes) formData.append("notes", values.notes);

            await createStockAdjustment(formData);
            toast.success(tCommon("actions.createSuccess"));
            onOpenChange(false);
            router.refresh();
        } catch (error: any) {
            console.error("Failed to create adjustment:", error);
            toast.error(error.message || tCommon("actions.createError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{t("form.createTitle")} - {product.name}</DialogTitle>
                    <DialogDescription>{product.sku}</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="form" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="form">{t("form.createTitle")}</TabsTrigger>
                        <TabsTrigger value="history">{t("history.title") || "History"}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="form" className="space-y-4 py-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <input type="hidden" {...form.register("productId")} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="warehouseId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("form.warehouse")}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                    >
                                                        <option value="">{t("form.selectWarehouse")}</option>
                                                        {warehouses.map((warehouse) => (
                                                            <option key={warehouse.id} value={warehouse.id}>
                                                                {warehouse.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="adjustmentType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("form.type")}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                    >
                                                        <option value="increase">{t("form.increase")}</option>
                                                        <option value="decrease">{t("form.decrease")}</option>
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("form.quantity")}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("form.reason")}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                    >
                                                        <option value="">{t("form.selectReason")}</option>
                                                        <option value="DAMAGE">{t("reasons.DAMAGE")}</option>
                                                        <option value="LOST">{t("reasons.LOST")}</option>
                                                        <option value="FOUND">{t("reasons.FOUND")}</option>
                                                        <option value="AUDIT">{t("reasons.AUDIT")}</option>
                                                        <option value="CORRECTION">{t("reasons.CORRECTION")}</option>
                                                        <option value="EXPIRED">{t("reasons.EXPIRED")}</option>
                                                        <option value="OTHER">{t("reasons.OTHER")}</option>
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.notes")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("form.notesPlaceholder")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                        {tCommon("buttons.cancel")}
                                    </Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? tCommon("buttons.saving") : tCommon("buttons.create")}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{tCommon("table.date")}</TableHead>
                                        <TableHead>{t("form.type")}</TableHead>
                                        <TableHead>{t("form.quantity")}</TableHead>
                                        <TableHead>{t("form.warehouse")}</TableHead>
                                        <TableHead>{t("form.reason")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingHistory ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                {tCommon("status.loading")}
                                            </TableCell>
                                        </TableRow>
                                    ) : history.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                {tCommon("table.noData")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        history.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {new Intl.DateTimeFormat('en-GB', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    }).format(new Date(item.createdAt))}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.movementType === "IN" || (item.quantity > 0) ? "default" : "destructive"}>
                                                        {item.movementType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{Math.abs(item.quantity)}</TableCell>
                                                <TableCell>{item.warehouse?.name}</TableCell>
                                                <TableCell>{item.notes}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
