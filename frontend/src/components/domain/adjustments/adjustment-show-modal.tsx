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
    const tCommon = useTranslations("common");

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
            <DialogContent className="sm:max-w-[600px] p-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-white rounded-none bg-white dark:bg-neo-dark">
                <div className="bg-neo-blue border-b-2 border-black dark:border-white p-3 flex justify-between items-center text-white">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">{t("show.title")}</h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{formatDateTime(adjustment.createdAt)}</span>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white border border-white dark:border-black hover:border-black dark:hover:border-white flex items-center justify-center transition-colors text-xs rounded-none">✕</button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-none">{t("show.details")}</h3>
                        <button
                            onClick={handleReverse}
                            className="bg-neo-orange text-white border-2 border-black dark:border-white px-3 py-1 font-black text-[10px] uppercase shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none flex items-center gap-2"
                        >
                            <RotateCcw className="w-3 h-3" />
                            {t("show.reverseAdjustment")}
                        </button>
                    </div>

                    <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none mb-3">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.product")}</p>
                        <p className="text-base font-black uppercase dark:text-white">{adjustment.product.name}</p>
                        <p className="text-[10px] font-bold text-gray-400">{adjustment.product.sku}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.warehouse")}</p>
                            <p className="font-bold text-sm uppercase dark:text-white">{adjustment.warehouse.name}</p>
                        </div>
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.quantity")}</p>
                            <p className={`text-base font-black ${adjustment.adjustmentType === 'increase' ? 'text-neo-green' : 'text-neo-orange'}`}>
                                {adjustment.adjustmentType === 'increase' ? '+' : '-'}
                                {adjustment.quantity} <span className="text-[10px] uppercase">{adjustment.product.unit}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.type")}</p>
                            <span className={`px-1.5 py-0.5 border border-black dark:border-white text-[9px] font-black uppercase rounded-none ${adjustment.adjustmentType === 'increase' ? 'bg-neo-green text-black' : 'bg-neo-orange text-white'}`}>
                                {adjustment.adjustmentType}
                            </span>
                        </div>
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.reason")}</p>
                            <p className="font-bold text-[10px] uppercase dark:text-white">{adjustment.reason}</p>
                        </div>
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.createdBy")}</p>
                            <p className="font-bold text-[10px] uppercase dark:text-white">{adjustment.createdBy.name}</p>
                        </div>
                    </div>

                    {adjustment.notes && (
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.notes")}</p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">"{adjustment.notes}"</p>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-2.5 border-2 border-transparent hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white transition-colors rounded-none text-sm uppercase tracking-widest"
                    >
                        {tCommon("buttons.close")}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
