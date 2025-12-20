"use client";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Warehouse, ProductPriceHistory, InventoryMovement, User } from "@prisma/client";
import { SerializedProduct } from "@/types/serialized";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-white rounded-none bg-white dark:bg-neo-dark">
                <div className="bg-neo-blue border-b-2 border-black dark:border-white p-3 flex justify-between items-center text-white">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Project Details</h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{product.sku}</span>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white border border-white dark:border-black hover:border-black dark:hover:border-white flex items-center justify-center transition-colors text-xs rounded-none">✕</button>
                </div>

                <ScrollArea className="flex-1 p-5">
                    <div className="space-y-4">
                        {/* Header Info */}
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none mb-3">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.productName") || "Product Name"}</p>
                            <p className="text-base font-black uppercase">{product.name}</p>
                        </div>

                        {/* Main Details */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.category")}</p>
                                <p className="font-bold text-sm dark:text-white">{product.category?.name || "-"}</p>
                            </div>
                            <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.unit")}</p>
                                <p className="font-bold text-sm uppercase">{product.unit}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.sellingPrice")}</p>
                                <p className="font-black text-neo-blue dark:text-neo-blue">{formatCurrency(product.sellingPrice)}</p>
                            </div>
                            <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.costPrice")}</p>
                                <p className="font-black dark:text-white">{formatCurrency(product.costPrice)}</p>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none max-h-32 overflow-y-auto neo-scrollbar mb-3">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.description")}</p>
                                <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 font-medium">{product.description}</p>
                            </div>
                        )}

                        {/* Stock Overview */}
                        <div className="border-t-2 border-black border-dashed pt-4 mt-6">
                            <h3 className="text-xs font-black uppercase tracking-wider mb-3 bg-black text-white inline-block px-1.5 py-0.5 rounded-none">{t("show.stockOverview")}</h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.totalStock")}</p>
                                    <span className="bg-neo-green text-black px-2 py-1 text-sm font-black border border-black dark:border-white rounded-none inline-block">{totalStock} {product.unit}</span>
                                </div>
                                <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none">
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1 font-black">{t("show.lowStockThreshold")}</p>
                                    <span className="bg-neo-orange text-white px-2 py-1 text-sm font-black border border-black dark:border-white rounded-none inline-block">{product.lowStockThreshold} {product.unit}</span>
                                </div>
                            </div>

                            <div className="border-2 border-black dark:border-white rounded-none overflow-hidden">
                                <table className="w-full text-[10px]">
                                    <thead className="bg-gray-100 dark:bg-gray-800 border-b-2 border-black dark:border-white text-black dark:text-white">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-black uppercase">{t("show.warehouse")}</th>
                                            <th className="px-3 py-2 text-right font-black uppercase">{t("show.quantity")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 text-black dark:text-white">
                                        {product.inventoryItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="px-3 py-4 text-center text-gray-500 uppercase font-black">
                                                    {t("show.noStock")}
                                                </td>
                                            </tr>
                                        ) : (
                                            product.inventoryItems.map((item) => (
                                                <tr key={item.id} className="border-b border-black dark:border-white last:border-0">
                                                    <td className="px-3 py-2 font-bold">{item.warehouse.name}</td>
                                                    <td className="px-3 py-2 text-right font-black">{item.quantityOnHand} {product.unit}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* History Section */}
                        <div className="border-t-2 border-black border-dashed pt-4 mt-6">
                            <h3 className="text-xs font-black uppercase tracking-wider mb-3 bg-black text-white inline-block px-1.5 py-0.5 rounded-none">{t("show.history")}</h3>
                            {loadingHistory ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : history ? (
                                <div className="space-y-4">
                                    {/* Stock Movements */}
                                    {history.movements?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">{t("show.stockMovements")}</h4>
                                            <div className="border-2 border-black rounded-none overflow-hidden max-h-[250px] overflow-y-auto neo-scrollbar">
                                                <table className="w-full text-[10px]">
                                                    <thead className="bg-gray-100 border-b-2 border-black sticky top-0">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left font-black uppercase">{t("show.date")}</th>
                                                            <th className="px-3 py-2 text-left font-black uppercase">{t("show.type")}</th>
                                                            <th className="px-3 py-2 text-right font-black uppercase">{t("show.quantity")}</th>
                                                            <th className="px-3 py-2 text-left font-black uppercase">{t("show.warehouse")}</th>
                                                            <th className="px-3 py-2 text-left font-black uppercase">{t("show.reference")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-900 text-black dark:text-white">
                                                        {history.movements.map((m) => (
                                                            <tr key={m.id} className="border-b border-black dark:border-white last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                                <td className="px-3 py-2 font-medium">{new Date(m.createdAt).toLocaleDateString()}</td>
                                                                <td className="px-3 py-2">
                                                                    <span className="border border-black px-1 py-0.5 text-[9px] font-black uppercase bg-gray-100">{m.movementType}</span>
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-black">
                                                                    <span className={m.quantity > 0 ? "text-neo-green" : "text-neo-orange"}>
                                                                        {m.quantity > 0 ? "+" : ""}{m.quantity}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2 font-bold">{m.warehouse?.name || "-"}</td>
                                                                <td className="px-3 py-2 text-[8px] font-black text-gray-500 uppercase">{m.referenceType} #{m.referenceId?.slice(-6)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs font-black uppercase text-neo-orange">{t("show.failedToLoadHistory")}</p>
                            )}
                        </div>
                    </div>
                </ScrollArea>

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
