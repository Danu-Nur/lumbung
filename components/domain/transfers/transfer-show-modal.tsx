"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { sendTransfer, completeTransfer } from "@/features/transfers/actions";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { SerializedStockTransfer } from "@/types/serialized";

interface TransferShowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transfer: SerializedStockTransfer;
    onSuccess?: () => void;
}

export function TransferShowModal({
    open,
    onOpenChange,
    transfer,
    onSuccess,
}: TransferShowModalProps) {
    const router = useRouter();
    const t = useTranslations("transfers");
    const tCommon = useTranslations("common");

    if (!transfer) return null;

    const handleAction = async (action: () => Promise<void>, successMessage: string) => {
        try {
            await action();
            toast.success(successMessage);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Action failed");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("title", { transferNumber: transfer.transferNumber })}</DialogTitle>
                    <DialogDescription>{formatDate(transfer.transferDate)}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{transfer.transferNumber}</h2>
                            <p className="text-muted-foreground">{formatDate(transfer.transferDate)}</p>
                        </div>
                        <div className="flex space-x-2">
                            {transfer.status === 'DRAFT' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleAction(async () => await sendTransfer(transfer.id), t("show.sendSuccess"))}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {t("show.sendTransfer")}
                                </Button>
                            )}
                            {transfer.status === 'IN_TRANSIT' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleAction(async () => await completeTransfer(transfer.id), t("show.completeSuccess"))}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {t("show.completeTransfer")}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{t("show.fromWarehouse")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">{transfer.fromWarehouse?.name}</p>
                                <p className="text-sm text-muted-foreground">{transfer.fromWarehouse?.code}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{t("show.toWarehouse")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">{transfer.toWarehouse?.name}</p>
                                <p className="text-sm text-muted-foreground">{transfer.toWarehouse?.code}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("show.transferItems")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">{t("show.product")}</th>
                                            <th className="text-right py-2">{t("show.quantity")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transfer.items.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0">
                                                <td className="py-2">
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                                                </td>
                                                <td className="text-right py-2">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {transfer.notes && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{t("show.notes")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{transfer.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
