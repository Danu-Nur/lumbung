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
            <DialogContent className="sm:max-w-[500px] p-0 border-2 border-black shadow-neo rounded-none bg-white overflow-hidden">
                <div className="bg-neo-blue border-b-2 border-black p-3 flex justify-between items-center">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">{warehouse.name}</h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{t("show.details")}</span>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-white border border-black hover:bg-black hover:text-white flex items-center justify-center transition-colors text-xs rounded-none">✕</button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-black p-3 bg-gray-50 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{t("show.name")}</h4>
                            <p className="text-sm font-bold uppercase">{warehouse.name}</p>
                        </div>
                        <div className="border border-black p-3 bg-gray-50 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{t("show.code")}</h4>
                            <p className="text-sm font-bold uppercase">{warehouse.code}</p>
                        </div>
                        <div className="border border-black p-3 bg-gray-50 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{t("show.phone")}</h4>
                            <p className="text-sm font-bold uppercase">{warehouse.phone || "-"}</p>
                        </div>
                        <div className="border border-black p-3 bg-gray-50 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{t("show.city")}</h4>
                            <p className="text-sm font-bold uppercase">{warehouse.city || "-"}</p>
                        </div>
                        <div className="col-span-2 border border-black p-3 bg-gray-50 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{t("show.address")}</h4>
                            <p className="text-sm font-bold uppercase">{warehouse.address || "-"}</p>
                        </div>
                        <div className="border border-black p-3 bg-gray-50 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{t("show.status")}</h4>
                            <Badge
                                variant={warehouse.isActive ? "default" : "secondary"}
                                className="rounded-none border-2 border-black font-black uppercase text-[10px] tracking-wider"
                            >
                                {warehouse.isActive ? t("show.active") : t("show.inactive")}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t-2 border-black bg-gray-50">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-full bg-white text-black font-bold py-2.5 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm rounded-none uppercase tracking-widest"
                    >
                        {useTranslations("common")("buttons.close") || "Close"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
