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

import { SerializedStockTransfer } from "@/types/serialized";

interface TransferEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transfer: SerializedStockTransfer;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string }>;
    onSuccess?: () => void;
}

export function TransferEditModal({
    open,
    onOpenChange,
}: TransferEditModalProps) {
    const t = useTranslations("transfers");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("form.editTitle")}</DialogTitle>
                    <DialogDescription>
                        Editing transfers is currently not supported. Please cancel this transfer and create a new one.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
