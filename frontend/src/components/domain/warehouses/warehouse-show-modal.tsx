"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Warehouse } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface WarehouseShowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouse: Warehouse;
}

export function WarehouseShowModal({
    open,
    onOpenChange,
    warehouse,
}: WarehouseShowModalProps) {
    const t = useTranslations("warehouses");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-white rounded-none bg-white dark:bg-neo-dark overflow-hidden">
                <div className="bg-neo-blue border-b-2 border-black dark:border-white p-3 flex justify-between items-center text-white">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold uppercase">{warehouse.name}</h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{t("show.details")}</span>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-6 h-6 bg-white dark:bg-white text-black border border-black dark:border-white flex items-center justify-center transition-colors text-xs rounded-none shadow-neo-hover dark:shadow-neo-hover-white hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1">{t("show.name")}</h4>
                            <p className="text-sm font-bold uppercase dark:text-white">{warehouse.name}</p>
                        </div>
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1">{t("show.code")}</h4>
                            <p className="text-sm font-bold uppercase dark:text-white">{warehouse.code}</p>
                        </div>
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1">{t("show.phone")}</h4>
                            <p className="text-sm font-bold uppercase dark:text-white">{warehouse.phone || "-"}</p>
                        </div>
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1">{t("show.city")}</h4>
                            <p className="text-sm font-bold uppercase dark:text-white">{warehouse.city || "-"}</p>
                        </div>
                        <div className="col-span-2 border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1">{t("show.address")}</h4>
                            <p className="text-sm font-bold uppercase dark:text-white">{warehouse.address || "-"}</p>
                        </div>
                        <div className="border border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-800 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1">{t("show.status")}</h4>
                            <Badge
                                variant={warehouse.isActive ? "default" : "secondary"}
                                className="rounded-none border-2 border-black dark:border-white font-black uppercase text-[10px] tracking-wider"
                            >
                                {warehouse.isActive ? t("show.active") : t("show.inactive")}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-neo-dark">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-full bg-white dark:bg-gray-800 text-black dark:text-white font-bold py-2.5 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm rounded-none uppercase tracking-widest"
                    >
                        {useTranslations("common")("buttons.close") || "Close"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
