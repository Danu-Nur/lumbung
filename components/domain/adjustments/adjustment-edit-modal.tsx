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

import { SerializedStockAdjustment } from "@/types/serialized";

interface AdjustmentEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    adjustment: SerializedStockAdjustment;
    products: Array<{ id: string; name: string; sku: string; unit: string }>;
    warehouses: Array<{ id: string; name: string }>;
    onSuccess?: () => void;
}

export function AdjustmentEditModal({
    open,
    onOpenChange,
}: AdjustmentEditModalProps) {
    const t = useTranslations("adjustments");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("form.editTitle")}</DialogTitle>
                    <DialogDescription>
                        Editing adjustments is not supported. Please reverse this adjustment and create a new one if needed.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
