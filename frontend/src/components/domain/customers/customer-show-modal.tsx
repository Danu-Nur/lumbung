"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Customer } from "@prisma/client";
import { useTranslations } from "next-intl";

interface CustomerShowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: Customer;
}

export function CustomerShowModal({
    open,
    onOpenChange,
    customer,
}: CustomerShowModalProps) {
    const t = useTranslations("customers");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{customer.name}</DialogTitle>
                    <DialogDescription>{t("show.details")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.name")}</h4>
                            <p className="text-sm font-medium">{customer.name}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.email")}</h4>
                            <p className="text-sm">{customer.email || "-"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.phone")}</h4>
                            <p className="text-sm">{customer.phone || "-"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.city")}</h4>
                            <p className="text-sm">{customer.city || "-"}</p>
                        </div>
                        <div className="col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.address")}</h4>
                            <p className="text-sm">{customer.address || "-"}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
