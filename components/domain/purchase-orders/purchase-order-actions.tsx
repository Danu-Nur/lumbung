"use client";

import { ActionColumn } from "@/components/shared/action-column";
import { useRouter, useSearchParams } from "next/navigation";
import { SerializedPurchaseOrder } from "@/types/serialized";

interface PurchaseOrderActionsProps {
    order: SerializedPurchaseOrder;
}

export function PurchaseOrderActions({ order }: PurchaseOrderActionsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Only allow edit if DRAFT
    const canEdit = order.status === 'DRAFT';

    return (
        <ActionColumn
            onView={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('modal', 'show');
                params.set('id', order.id);
                router.push(`?${params.toString()}`, { scroll: false });
            }}
            onEdit={canEdit ? () => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('modal', 'edit');
                params.set('id', order.id);
                router.push(`?${params.toString()}`, { scroll: false });
            } : undefined}
        />
    );
}
