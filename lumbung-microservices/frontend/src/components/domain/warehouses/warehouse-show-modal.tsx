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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{warehouse.name}</DialogTitle>
                    <DialogDescription>{t("show.details")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.name")}</h4>
                            <p className="text-sm font-medium">{warehouse.name}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.code")}</h4>
                            <p className="text-sm">{warehouse.code}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.phone")}</h4>
                            <p className="text-sm">{warehouse.phone || "-"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.city")}</h4>
                            <p className="text-sm">{warehouse.city || "-"}</p>
                        </div>
                        <div className="col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.address")}</h4>
                            <p className="text-sm">{warehouse.address || "-"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.status")}</h4>
                            <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                                {warehouse.isActive ? t("show.active") : t("show.inactive")}
                            </Badge>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
