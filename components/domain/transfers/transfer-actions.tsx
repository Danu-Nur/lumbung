"use client";

import { useRouter } from "next/navigation";
import { ActionColumn } from "@/components/shared/action-column";

import { SerializedStockTransfer } from "@/types/serialized";

interface TransferActionsProps {
    transfer: SerializedStockTransfer;
}

export function TransferActions({ transfer }: TransferActionsProps) {
    const router = useRouter();

    return (
        <ActionColumn
            onView={() => router.push(`?modal=show&id=${transfer.id}`, { scroll: false })}
            onEdit={transfer.status === 'DRAFT' ? () => router.push(`?modal=edit&id=${transfer.id}`, { scroll: false }) : undefined}
        />
    );
}
