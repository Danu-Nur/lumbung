"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Supplier } from "@prisma/client";
import { deleteSupplier } from "@/features/suppliers/actions";
import { ActionColumn } from "@/components/shared/action-column";
import { DeleteConfirmationModal } from "@/components/shared/delete-confirmation-modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface SupplierActionsProps {
    supplier: Supplier;
}

export function SupplierActions({ supplier }: SupplierActionsProps) {
    const router = useRouter();
    const t = useTranslations("common");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteSupplier(supplier.id);
            toast.success(t("actions.deleteSuccess"));
            setDeleteOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Failed to delete supplier:", error);
            toast.error(error.message || t("actions.deleteError"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <ActionColumn
                onView={() => router.push(`?modal=show&id=${supplier.id}`, { scroll: false })}
                onEdit={() => router.push(`?modal=edit&id=${supplier.id}`, { scroll: false })}
                onDelete={() => setDeleteOpen(true)}
            />

            <DeleteConfirmationModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                title={t("actions.deleteTitle")}
                description={t("actions.deleteConfirmDescription", { name: supplier.name })}
                loading={isDeleting}
            />
        </>
    );
}
