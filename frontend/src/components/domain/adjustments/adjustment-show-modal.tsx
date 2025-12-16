"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { reverseStockAdjustment } from "@/features/adjustments/actions";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { SerializedStockAdjustment } from "@/types/serialized";

interface AdjustmentShowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    adjustment: SerializedStockAdjustment;
    onSuccess?: () => void;
}

export function AdjustmentShowModal({
    open,
    onOpenChange,
    adjustment,
    onSuccess,
}: AdjustmentShowModalProps) {
    const router = useRouter();
    const t = useTranslations("adjustments");

    if (!adjustment) return null;

    const handleReverse = async () => {
        try {
            await reverseStockAdjustment(adjustment.id);
            toast.success(t("show.reverseSuccess"));
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t("show.reverseError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t("show.title")}</DialogTitle>
                    <DialogDescription>{formatDateTime(adjustment.createdAt)}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{t("show.details")}</h2>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleReverse}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {t("show.reverseAdjustment")}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t("show.product")}</label>
                            <p className="text-base font-medium mt-1">{adjustment.product.name}</p>
                            <p className="text-sm text-muted-foreground">{adjustment.product.sku}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t("show.warehouse")}</label>
                            <p className="text-base font-medium mt-1">{adjustment.warehouse.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t("show.type")}</label>
                            <div className="mt-1">
                                <Badge variant={adjustment.adjustmentType === 'increase' ? 'default' : 'destructive'}>
                                    {adjustment.adjustmentType.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t("show.quantity")}</label>
                            <p className={`text-base font-bold mt-1 ${adjustment.adjustmentType === 'increase'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                                }`}>
                                {adjustment.adjustmentType === 'increase' ? '+' : '-'}
                                {adjustment.quantity} {adjustment.product.unit}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t("show.reason")}</label>
                            <p className="text-base font-medium mt-1">{adjustment.reason}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t("show.createdBy")}</label>
                            <p className="text-base font-medium mt-1">{adjustment.createdBy.name}</p>
                        </div>
                    </div>

                    {adjustment.notes && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t("show.notes")}</label>
                            <p className="text-base mt-1 p-3 bg-muted/50 rounded-lg">{adjustment.notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
