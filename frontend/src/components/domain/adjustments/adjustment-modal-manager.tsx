"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AdjustmentCreateModal } from "./adjustment-create-modal";
import { AdjustmentEditModal } from "./adjustment-edit-modal";
import { AdjustmentShowModal } from "./adjustment-show-modal";
import { SerializedStockAdjustment } from "@/types/serialized";

interface AdjustmentModalManagerProps {
    adjustments: SerializedStockAdjustment[];
    products: Array<{ id: string; name: string; sku: string; unit: string }>;
    warehouses: Array<{ id: string; name: string }>;
}

export function AdjustmentModalManager({ adjustments, products, warehouses }: AdjustmentModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const modal = searchParams.get("modal");
    const id = searchParams.get("id");

    const createOpen = modal === "create";
    const editOpen = modal === "edit";
    const showOpen = modal === "show";

    const selectedAdjustment = id ? adjustments.find((a) => a.id === id) : undefined;

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
            <AdjustmentCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                products={products}
                warehouses={warehouses}
                onSuccess={handleSuccess}
            />

            {selectedAdjustment && (
                <>
                    <AdjustmentEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        adjustment={selectedAdjustment}
                        products={products}
                        warehouses={warehouses}
                        onSuccess={handleSuccess}
                    />
                    <AdjustmentShowModal
                        open={showOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        adjustment={selectedAdjustment}
                        onSuccess={handleSuccess}
                    />
                </>
            )}
        </>
    );
}
