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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{category.name}</DialogTitle>
                    <DialogDescription>{t("show.details")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.name")}</h4>
                            <p className="text-sm font-medium">{category.name}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">{t("show.description")}</h4>
                            <p className="text-sm">{category.description || "-"}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
