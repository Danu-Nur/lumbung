"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActionColumn } from "@/components/shared/action-column";
import { DeleteConfirmationModal } from "@/components/shared/delete-confirmation-modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cancelSalesOrder } from "@/features/sales-orders/actions";

import { SerializedSalesOrder } from "@/types/serialized";

interface SalesOrderActionsProps {
    order: SerializedSalesOrder;
}

export function SalesOrderActions({ order }: SalesOrderActionsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations("common");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await cancelSalesOrder(order.id);
            toast.success(t("actions.cancelSuccess"));
            setDeleteOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Failed to cancel order:", error);
            toast.error(error.message || t("actions.cancelError"));
        } finally {
            setIsDeleting(false);
        }
    };

    // Only allow delete (cancel) if status is DRAFT or CONFIRMED
    const canDelete = ['DRAFT', 'CONFIRMED'].includes(order.status);

    return (
        <>
            <ActionColumn
                onView={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('modal', 'show');
                    params.set('id', order.id);
                    router.push(`?${params.toString()}`, { scroll: false });
                }}
                onEdit={order.status === 'DRAFT' ? () => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('modal', 'edit');
                    params.set('id', order.id);
                    router.push(`?${params.toString()}`, { scroll: false });
                } : undefined}
                onDelete={canDelete ? () => setDeleteOpen(true) : undefined}
            />

            <DeleteConfirmationModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                title={t("actions.cancelTitle")}
                description={t("actions.cancelDescription", { name: order.orderNumber })}
                loading={isDeleting}

            />
        </>
    );
}
