"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TransferCreateModal } from "./transfer-create-modal";
import { TransferEditModal } from "./transfer-edit-modal";
import { TransferShowModal } from "./transfer-show-modal";
import { SerializedStockTransfer } from "@/types/serialized";

interface TransferModalManagerProps {
    transfers?: SerializedStockTransfer[];
    selectedTransfer?: SerializedStockTransfer;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string }>;
}

export function TransferModalManager({ transfers, selectedTransfer, warehouses, products }: TransferModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const modal = searchParams.get("modal");

    // If selectedTransfer is provided, use it. Otherwise try to find it in transfers list (fallback)
    const id = searchParams.get("id");
    const activeTransfer = selectedTransfer || (id && transfers ? transfers.find((t) => t.id === id) : undefined);

    const createOpen = modal === "create";
    const editOpen = modal === "edit";
    const showOpen = modal === "show";

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("id");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSuccess = () => {
        handleClose();
        router.refresh();
    };

    return (
        <>
            <TransferCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                warehouses={warehouses}
                products={products}
                onSuccess={handleSuccess}
            />

            {activeTransfer && (
                <>
                    <TransferEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        transfer={activeTransfer}
                        warehouses={warehouses}
                        products={products}
                        onSuccess={handleSuccess}
                    />
                    <TransferShowModal
                        open={showOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        transfer={activeTransfer}
                        onSuccess={handleSuccess}
                    />
                </>
            )}
        </>
    );
}
