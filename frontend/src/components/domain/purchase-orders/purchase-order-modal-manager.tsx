"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PurchaseOrderCreateModal } from "./purchase-order-create-modal";
import { PurchaseOrderEditModal } from "./purchase-order-edit-modal";
import { PurchaseOrderShowModal } from "./purchase-order-show-modal";
import { SerializedPurchaseOrder } from "@/types/serialized";

interface PurchaseOrderModalManagerProps {
    orders: SerializedPurchaseOrder[];
    suppliers: Array<{ id: string; name: string }>;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string; costPrice: number }>;
    onSuccess?: () => void;
}

export function PurchaseOrderModalManager({ orders, suppliers, warehouses, products, onSuccess }: PurchaseOrderModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const modal = searchParams.get("modal");
    const id = searchParams.get("id");

    const createOpen = modal === "create";
    const editOpen = modal === "edit";
    const showOpen = modal === "show";

    const selectedOrder = id ? orders.find((o) => o.id === id) : undefined;

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("id");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSuccess = () => {
        handleClose();
        if (onSuccess) onSuccess();
        router.refresh();
    };

    return (
        <>
            <PurchaseOrderCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                suppliers={suppliers}
                warehouses={warehouses}
                products={products}
                onSuccess={handleSuccess}
            />

            {selectedOrder && (
                <>
                    <PurchaseOrderEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        order={selectedOrder}
                        suppliers={suppliers}
                        warehouses={warehouses}
                        products={products}
                        onSuccess={handleSuccess}
                    />
                    <PurchaseOrderShowModal
                        open={showOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        order={selectedOrder}
                        onSuccess={handleSuccess}
                    />
                </>
            )}
        </>
    );
}
