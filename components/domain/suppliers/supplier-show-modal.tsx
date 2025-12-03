"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Supplier } from "@prisma/client";
import { useTranslations } from "next-intl";

interface SupplierShowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier;
}

export function SupplierShowModal({
    open,
    onOpenChange,
    supplier,
}: SupplierShowModalProps) {
    const t = useTranslations("suppliers");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{supplier.name}</DialogTitle>
                    <DialogDescription>{t("show.details")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.name")}</h4>
                            <p className="text-sm font-medium">{supplier.name}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.email")}</h4>
                            <p className="text-sm">{supplier.email || "-"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.phone")}</h4>
                            <p className="text-sm">{supplier.phone || "-"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.city")}</h4>
                            <p className="text-sm">{supplier.city || "-"}</p>
                        </div>
                        <div className="col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.address")}</h4>
                            <p className="text-sm">{supplier.address || "-"}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
