"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ActionColumn } from "@/components/shared/action-column";

import { SerializedStockAdjustment } from "@/types/serialized";

interface AdjustmentActionsProps {
    adjustment: SerializedStockAdjustment;
}

export function AdjustmentActions({ adjustment }: AdjustmentActionsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    return (
        <ActionColumn
            onView={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('modal', 'show');
                params.set('id', adjustment.id);
                router.push(`?${params.toString()}`, { scroll: false });
            }}
        />
    );
}
