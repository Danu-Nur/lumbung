"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

    const isDeletingRef = useRef(false);
    const searchParams = useSearchParams();

    const handleDelete = async () => {
        if (isDeletingRef.current) return;
        isDeletingRef.current = true;
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
            isDeletingRef.current = false;
        }
    };

    const handleAction = (modal: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('modal', modal);
        params.set('id', warehouse.id);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            <ActionColumn
                onView={() => handleAction('show')}
                onEdit={() => handleAction('edit')}
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
