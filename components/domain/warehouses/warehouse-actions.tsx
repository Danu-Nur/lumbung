"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Warehouse } from "@prisma/client";
import { deleteWarehouse } from "@/features/warehouses/actions";
import { ActionColumn } from "@/components/shared/action-column";
import { DeleteConfirmationModal } from "@/components/shared/delete-confirmation-modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface WarehouseActionsProps {
    warehouse: Warehouse;
}

export function WarehouseActions({ warehouse }: WarehouseActionsProps) {
    const router = useRouter();
    const t = useTranslations("common");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteWarehouse(warehouse.id);
            toast.success(t("actions.deleteSuccess"));
            setDeleteOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Failed to delete warehouse:", error);
            toast.error(error.message || t("actions.deleteError"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <ActionColumn
                onView={() => router.push(`?modal=show&id=${warehouse.id}`, { scroll: false })}
                onEdit={() => router.push(`?modal=edit&id=${warehouse.id}`, { scroll: false })}
                onDelete={() => setDeleteOpen(true)}
            />

            <DeleteConfirmationModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                title={t("actions.deleteTitle")}
                description={t("actions.deleteConfirmDescription", { name: warehouse.name })}
                loading={isDeleting}
            />
        </>
    );
}
