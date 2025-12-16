"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

import { SerializedPurchaseOrder } from "@/types/serialized";

interface PurchaseOrderEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: SerializedPurchaseOrder;
    suppliers: Array<{ id: string; name: string }>;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string; costPrice: number }>;
    onSuccess?: () => void;
}

export function PurchaseOrderEditModal({
    open,
    onOpenChange,
}: PurchaseOrderEditModalProps) {
    const t = useTranslations("purchaseOrders");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("form.editTitle")}</DialogTitle>
                    <DialogDescription>
                        Editing purchase orders is currently not supported. Please cancel this order and create a new one.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
