"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@prisma/client";
import { deleteCategory } from "@/features/categories/actions";
import { ActionColumn } from "@/components/shared/action-column";
import { DeleteConfirmationModal } from "@/components/shared/delete-confirmation-modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface CategoryActionsProps {
    category: Category;
}

export function CategoryActions({ category }: CategoryActionsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations("common");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAction = (modal: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('modal', modal);
        params.set('id', category.id);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const isDeletingRef = useRef(false);

    const handleDelete = async () => {
        if (isDeletingRef.current) return;
        isDeletingRef.current = true;
        setIsDeleting(true);
        try {
            await deleteCategory(category.id);
            toast.success(t("actions.deleteSuccess"));
            setDeleteOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Failed to delete category:", error);
            toast.error(error.message || t("actions.deleteError"));
        } finally {
            setIsDeleting(false);
            isDeletingRef.current = false;
        }
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
                title={t("actions.deleteConfirmTitle")}
                description={t("actions.deleteConfirmDescription", { name: category.name })}
                loading={isDeleting}
            />
        </>
    );
}
