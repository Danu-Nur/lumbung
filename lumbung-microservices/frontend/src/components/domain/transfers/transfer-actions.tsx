"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ActionColumn } from "@/components/shared/action-column";

import { SerializedStockTransfer } from "@/types/serialized";

interface TransferActionsProps {
    transfer: SerializedStockTransfer;
}

export function TransferActions({ transfer }: TransferActionsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    return (
        <ActionColumn
            onView={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('modal', 'show');
                params.set('id', transfer.id);
                router.push(`?${params.toString()}`, { scroll: false });
            }}
            onEdit={transfer.status === 'DRAFT' ? () => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('modal', 'edit');
                params.set('id', transfer.id);
                router.push(`?${params.toString()}`, { scroll: false });
            } : undefined}
        />
    );
}
