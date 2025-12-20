"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
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
    const queryClient = useQueryClient();
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

            // Invalidate React Query Caches
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });

            // Refresh history for the tab
            await fetchHistory();

            form.reset({
                ...form.getValues(),
                quantity: 1,
                reason: "",
                notes: "",
            });

            // Optionally close the modal after a short delay
            setTimeout(() => {
                onOpenChange(false);
            }, 1000);

            router.refresh();
        } catch (error: any) {
            console.error("Failed to create adjustment:", error);
            toast.error(error.message || tCommon("actions.createError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 border-2 border-black shadow-neo rounded-none bg-white">
                <div className="bg-neo-yellow border-b-2 border-black p-3 flex justify-between items-center">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">{t("form.createTitle")}</h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{product.name} ({product.sku})</span>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-white border border-black hover:bg-black hover:text-white flex items-center justify-center transition-colors text-xs rounded-none">✕</button>
                </div>

                <Tabs defaultValue="form" className="w-full">
                    <TabsList className="flex rounded-none border-b-2 border-black bg-white p-0 h-auto">
                        <TabsTrigger
                            value="form"
                            className="flex-1 py-2.5 px-3 font-bold border-r-2 border-black text-sm rounded-none data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black hover:bg-gray-100 transition-all"
                        >
                            {t("form.createTitle")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="flex-1 py-2.5 px-3 font-bold text-sm rounded-none data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black hover:bg-gray-100 transition-all"
                        >
                            {t("history.title") || "History"}
                        </TabsTrigger>
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
                                                <FormLabel className="text-xs font-black uppercase tracking-wider">{t("form.warehouse")}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="flex h-10 w-full rounded-none bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 neo-brutal-style border-2 border-black"
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
                                                <FormLabel className="text-xs font-black uppercase tracking-wider">{t("form.type")}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="flex h-10 w-full rounded-none bg-white px-3 py-2 text-sm border-2 border-black focus:outline-none focus:bg-neo-yellow/5 focus:shadow-neo-sm transition-all"
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
                                                <FormLabel className="text-xs font-black uppercase tracking-wider">{t("form.quantity")}</FormLabel>
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
                                                <FormLabel className="text-xs font-black uppercase tracking-wider">{t("form.reason")}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="flex h-10 w-full rounded-none bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 neo-brutal-style border-2 border-black"
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
                                            <FormLabel className="text-xs font-black uppercase tracking-wider">{t("form.notes")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("form.notesPlaceholder")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="p-5 border-t-2 border-black bg-gray-50 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => onOpenChange(false)}
                                        className="flex-1 bg-white text-black font-bold py-2 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm rounded-none uppercase"
                                    >
                                        {tCommon("buttons.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.formState.isSubmitting}
                                        className="flex-1 bg-black text-white font-bold py-2 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-neo-yellow hover:text-black transition-all text-sm rounded-none uppercase"
                                    >
                                        {form.formState.isSubmitting ? tCommon("buttons.saving") : tCommon("buttons.create")}
                                    </button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="history" className="p-5">
                        <div className="rounded-none border-2 border-black shadow-neo-sm overflow-hidden bg-white">
                            <Table>
                                <TableHeader className="bg-gray-100">
                                    <TableRow className="border-b-2 border-black hover:bg-gray-100">
                                        <TableHead className="font-black text-black uppercase text-[10px] h-10">{tCommon("table.date")}</TableHead>
                                        <TableHead className="font-black text-black uppercase text-[10px] h-10">{t("form.type")}</TableHead>
                                        <TableHead className="font-black text-black uppercase text-[10px] h-10">{t("form.quantity")}</TableHead>
                                        <TableHead className="font-black text-black uppercase text-[10px] h-10">{t("form.warehouse")}</TableHead>
                                        <TableHead className="font-black text-black uppercase text-[10px] h-10">{t("form.reason")}</TableHead>
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
