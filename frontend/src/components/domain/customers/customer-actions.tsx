"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Customer } from "@prisma/client";
import { deleteCustomer } from "@/features/customers/actions";
import { ActionColumn } from "@/components/shared/action-column";
import { DeleteConfirmationModal } from "@/components/shared/delete-confirmation-modal";
import { toast } from '@/components/ui/sonner';
import { useTranslations } from "next-intl";

interface CustomerActionsProps {
    customer: Customer;
}

export function CustomerActions({ customer }: CustomerActionsProps) {
    const router = useRouter();
    const t = useTranslations("common");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteCustomer(customer.id);
            toast.success(t("actions.deleteSuccess"));
            setDeleteOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Failed to delete customer:", error);
            toast.error(error.message || t("actions.deleteError"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <ActionColumn
                onView={() => router.push(`?modal=show&id=${customer.id}`, { scroll: false })}
                onEdit={() => router.push(`?modal=edit&id=${customer.id}`, { scroll: false })}
                onDelete={() => setDeleteOpen(true)}
            />

            <DeleteConfirmationModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                title={t("actions.deleteTitle")}
                description={t("actions.deleteConfirmDescription", { name: customer.name })}
                loading={isDeleting}
            />
        </>
    );
}
