"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Category } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface CategoryShowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category;
}

export function CategoryShowModal({
    open,
    onOpenChange,
    category,
}: CategoryShowModalProps) {
    const t = useTranslations("categories");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 border-2 border-black shadow-neo rounded-none bg-white overflow-hidden">
                <div className="bg-neo-blue border-b-2 border-black p-3 flex justify-between items-center text-black">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold uppercase">{category.name}</h2>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{t("show.details")}</span>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-black text-white hover:bg-white hover:text-black border border-black flex items-center justify-center transition-colors text-xs rounded-none">✕</button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-black p-3 bg-gray-50 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{t("show.name")}</h4>
                            <p className="text-sm font-bold uppercase">{category.name}</p>
                        </div>
                        <div className="col-span-2 border border-black p-3 bg-gray-50 rounded-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{t("show.description")}</h4>
                            <p className="text-sm font-bold uppercase">{category.description || "-"}</p>
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
