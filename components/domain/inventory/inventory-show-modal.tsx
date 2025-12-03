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
import { Category, InventoryItem, Warehouse, ProductPriceHistory, InventoryMovement, User } from "@prisma/client";
import { SerializedProduct } from "@/types/serialized";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getProductHistory } from "@/features/inventory/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

type HistoryType = {
    priceHistory: (ProductPriceHistory & { createdBy: User })[];
    movements: (InventoryMovement & { warehouse: Warehouse })[];
} | null;

interface InventoryShowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: SerializedProduct;
}

export function InventoryShowModal({
    open,
    onOpenChange,
    product,
}: InventoryShowModalProps) {
    const t = useTranslations("inventory");
    const tCommon = useTranslations("common");
    const [history, setHistory] = useState<HistoryType>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (open && product) {
            setLoadingHistory(true);
            getProductHistory(product.id)
                .then(setHistory)
                .catch(console.error)
                .finally(() => setLoadingHistory(false));
        }
    }, [open, product]);

    const totalStock = product.inventoryItems.reduce(
        (sum, item) => sum + item.quantityOnHand,
        0
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription>{product.sku}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Main Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("show.category")}</p>
                            <p>{product.category?.name || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("show.unit")}</p>
                            <p>{product.unit}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("show.sellingPrice")}</p>
                            <p>{formatCurrency(product.sellingPrice)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("show.costPrice")}</p>
                            <p>{formatCurrency(product.costPrice)}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("show.description")}</p>
                            <p className="text-sm">{product.description}</p>
                        </div>
                    )}

                    {/* Stock Overview */}
                    <div>
                        <h3 className="font-semibold mb-2">{t("show.stockOverview")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium text-muted-foreground">{t("show.totalStock")}</p>
                                <p className="text-2xl font-bold">{totalStock} {product.unit}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium text-muted-foreground">{t("show.lowStockThreshold")}</p>
                                <p className="text-2xl font-bold">{product.lowStockThreshold} {product.unit}</p>
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-2 text-left">{t("show.warehouse")}</th>
                                        <th className="px-4 py-2 text-right">{t("show.quantity")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.inventoryItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-4 text-center text-muted-foreground">
                                                {t("show.noStock")}
                                            </td>
                                        </tr>
                                    ) : (
                                        product.inventoryItems.map((item) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="px-4 py-2">{item.warehouse.name}</td>
                                                <td className="px-4 py-2 text-right">{item.quantityOnHand} {product.unit}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* History Section */}
                    <div>
                        <h3 className="font-semibold mb-2">{t("show.history")}</h3>
                        {loadingHistory ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : history ? (
                            <div className="space-y-4">
                                {/* Price History */}
                                {history.priceHistory?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">{t("show.priceHistory")}</h4>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">{t("show.date")}</th>
                                                        <th className="px-4 py-2 text-left">{t("show.type")}</th>
                                                        <th className="px-4 py-2 text-right">{t("show.price")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {history.priceHistory.map((h) => (
                                                        <tr key={h.id} className="border-t">
                                                            <td className="px-4 py-2">{new Date(h.createdAt).toLocaleDateString()}</td>
                                                            <td className="px-4 py-2">{h.priceType}</td>
                                                            <td className="px-4 py-2 text-right">{formatCurrency(Number(h.price))}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Stock Movements */}
                                {history.movements?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">{t("show.stockMovements")}</h4>
                                        <div className="border rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">{t("show.date")}</th>
                                                        <th className="px-4 py-2 text-left">{t("show.type")}</th>
                                                        <th className="px-4 py-2 text-right">{t("show.quantity")}</th>
                                                        <th className="px-4 py-2 text-left">{t("show.warehouse")}</th>
                                                        <th className="px-4 py-2 text-left">{t("show.reference")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {history.movements.map((m) => (
                                                        <tr key={m.id} className="border-t">
                                                            <td className="px-4 py-2">{new Date(m.createdAt).toLocaleDateString()}</td>
                                                            <td className="px-4 py-2">
                                                                <Badge variant="outline">{m.movementType}</Badge>
                                                            </td>
                                                            <td className="px-4 py-2 text-right">
                                                                <span className={m.quantity > 0 ? "text-green-600" : "text-red-600"}>
                                                                    {m.quantity > 0 ? "+" : ""}{m.quantity}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2">{m.warehouse?.name || "-"}</td>
                                                            <td className="px-4 py-2 text-xs text-muted-foreground">{m.referenceType} #{m.referenceId?.slice(-6)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {(!history.priceHistory?.length && !history.movements?.length) && (
                                    <p className="text-sm text-muted-foreground">{t("show.noHistory")}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">{t("show.failedToLoadHistory")}</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {tCommon("actions.close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
