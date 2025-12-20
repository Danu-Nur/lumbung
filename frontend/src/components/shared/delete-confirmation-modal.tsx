"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface DeleteConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

export function DeleteConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    loading,
}: DeleteConfirmationModalProps) {
    const t = useTranslations("common");

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="p-0 border-2 border-black shadow-neo rounded-none bg-white">
                <div className="bg-neo-orange border-b-2 border-black p-3 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold uppercase tracking-tight">{title || t("actions.deleteConfirmTitle")}</h2>
                    <button onClick={() => onOpenChange(false)} className="w-6 h-6 bg-white border border-black shadow-neo-sm text-black hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] flex items-center justify-center transition-all text-xs rounded-none">✕</button>
                </div>

                <div className="p-5">
                    <div className="mb-4 flex gap-3 items-start">
                        <div className="bg-black text-white p-2 border border-black shrink-0 rounded-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="square" stroke-linejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase mb-1">{t("actions.deleteConfirmTitle")}?</h3>
                            <p className="text-gray-700 text-sm leading-snug font-medium">
                                {description || t("actions.deleteConfirmDescription")}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-5">
                        <button
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="flex-1 bg-white text-black font-bold py-2 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none text-sm uppercase"
                        >
                            {t("buttons.cancel")}
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onConfirm();
                            }}
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white font-bold py-2 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none text-sm uppercase"
                        >
                            {loading ? t("actions.deleting") : t("buttons.delete")}
                        </button>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
