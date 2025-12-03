"use client";

import { useRouter } from "next/navigation";
import { ActionColumn } from "@/components/shared/action-column";

import { SerializedStockAdjustment } from "@/types/serialized";

interface AdjustmentActionsProps {
    adjustment: SerializedStockAdjustment;
}

export function AdjustmentActions({ adjustment }: AdjustmentActionsProps) {
    const router = useRouter();

    return (
        <ActionColumn
            onView={() => router.push(`?modal=show&id=${adjustment.id}`, { scroll: false })}
        />
    );
}
