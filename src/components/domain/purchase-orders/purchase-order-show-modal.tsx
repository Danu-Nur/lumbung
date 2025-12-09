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
import { formatCurrency, formatDate } from "@/lib/utils";
import { receivePurchaseOrder, updatePurchaseOrderStatus } from "@/features/purchase-orders/actions";
import { Package, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { SerializedPurchaseOrder } from "@/types/serialized";

interface PurchaseOrderShowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: SerializedPurchaseOrder;
    onSuccess?: () => void;
}

export function PurchaseOrderShowModal({
    open,
    onOpenChange,
    order,
    onSuccess,
}: PurchaseOrderShowModalProps) {
    const router = useRouter();
    const t = useTranslations("purchaseOrders");
    const tCommon = useTranslations("common");

    if (!order) return null;

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
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("title", { poNumber: order.poNumber })}</DialogTitle>
                    <DialogDescription>{formatDate(order.orderDate)}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{order.poNumber}</h2>
                            <p className="text-muted-foreground">{formatDate(order.orderDate)}</p>
                        </div>
                        <div className="flex space-x-2">
                            {order.status === 'DRAFT' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleAction(async () => await updatePurchaseOrderStatus(order.id, 'SENT'), t("show.sendSuccess"))}
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    {t("show.sendOrder")}
                                </Button>
                            )}
                            {order.status === 'SENT' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleAction(async () => await receivePurchaseOrder(order.id), t("show.receiveSuccess"))}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {t("show.receiveItems")}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{t("show.supplier")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">{order.supplier?.name}</p>
                                <p className="text-sm text-muted-foreground">{order.supplier?.email}</p>
                                <p className="text-sm text-muted-foreground">{order.supplier?.phone}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{t("show.warehouse")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">{order.warehouse?.name}</p>
                                <p className="text-sm text-muted-foreground">{order.warehouse?.code}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("show.orderItems")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">{t("show.product")}</th>
                                            <th className="text-right py-2">{t("show.qty")}</th>
                                            <th className="text-right py-2">{t("show.cost")}</th>
                                            <th className="text-right py-2">{t("show.total")}</th>
                                            <th className="text-right py-2">{t("show.received")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0">
                                                <td className="py-2">
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                                                </td>
                                                <td className="text-right py-2">{item.quantity}</td>
                                                <td className="text-right py-2">{formatCurrency(Number(item.unitCost))}</td>
                                                <td className="text-right py-2 font-medium">{formatCurrency(Number(item.lineTotal))}</td>
                                                <td className="text-right py-2">
                                                    {item.receivedQty}/{item.quantity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>{t("show.total")}:</span>
                                    <span>{formatCurrency(Number(order.total))}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {order.notes && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{t("show.notes")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
