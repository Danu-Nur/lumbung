"use client";

import { useRouter } from "next/navigation";
import { ActionColumn } from "@/components/shared/action-column";

import { SerializedPurchaseOrder } from "@/types/serialized";

interface PurchaseOrderActionsProps {
    order: SerializedPurchaseOrder;
}

export function PurchaseOrderActions({ order }: PurchaseOrderActionsProps) {
    const router = useRouter();

    return (
        <ActionColumn
            onView={() => router.push(`?modal=show&id=${order.id}`, { scroll: false })}
            onEdit={order.status === 'DRAFT' ? () => router.push(`?modal=edit&id=${order.id}`, { scroll: false }) : undefined}
        />
    );
}
