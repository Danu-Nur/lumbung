"use client";

import { useState } from "react";
import { SerializedStockOpnameItem } from "@/types/serialized";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { saveOpnameItem } from "@/lib/actions/opname";
import { cn } from "@/lib/utils"; // Import cn
import { toast } from '@/components/ui/sonner'; // Import toast

interface OpnameExecutionTableProps {
    items: SerializedStockOpnameItem[];
    status: string;
}

export function OpnameExecutionTable({ items, status }: OpnameExecutionTableProps) {
    const t = useTranslations("opname.show");
    const tCommon = useTranslations("common");

    // Local state management could be added for optimistic updates, 
    // but for now relying on server revalidation onBlur.

    const handleSave = async (itemId: string, value: string) => {
        if (status !== 'IN_PROGRESS') return;

        try {
            const numValue = value === '' ? 0 : parseInt(value);
            if (isNaN(numValue)) return;

            await saveOpnameItem(itemId, numValue);
        } catch (error) {
            toast.error("Failed to save item");
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("product")}</TableHead>
                        <TableHead className="text-right">{t("systemQty")}</TableHead>
                        <TableHead className="text-right w-[150px]">{t("actualQty")}</TableHead>
                        <TableHead className="text-right">{t("difference")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div className="font-medium">{item.product.name}</div>
                                <div className="text-xs text-muted-foreground">{item.product.sku}</div>
                            </TableCell>
                            <TableCell className="text-right">
                                {item.systemQty} {item.product.unit}
                            </TableCell>
                            <TableCell className="text-right">
                                <Input
                                    type="number"
                                    defaultValue={item.actualQty ?? ''}
                                    className="text-right h-8"
                                    disabled={status !== 'IN_PROGRESS'}
                                    onBlur={(e) => handleSave(item.id, e.target.value)}
                                    placeholder="0"
                                />
                            </TableCell>
                            <TableCell className={cn(
                                "text-right font-medium",
                                item.difference && item.difference < 0 ? "text-red-500" :
                                    item.difference && item.difference > 0 ? "text-green-500" : ""
                            )}>
                                {(item.difference !== null && item.difference !== undefined) ? (
                                    <>
                                        {item.difference > 0 ? "+" : ""}
                                        {item.difference}
                                    </>
                                ) : "-"}
                            </TableCell>
                        </TableRow>
                    ))}
                    {items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                {tCommon('table.noData')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
