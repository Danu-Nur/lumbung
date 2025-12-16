"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SalesOrderCreateModal } from "./sales-order-create-modal";
import { SalesOrderEditModal } from "./sales-order-edit-modal";
import { SalesOrderShowModal } from "./sales-order-show-modal";
import { SerializedSalesOrder } from "@/types/serialized";

interface SalesOrderModalManagerProps {
    orders: SerializedSalesOrder[];
    customers: Array<{ id: string; name: string }>;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string; sellingPrice: number }>;
}

export function SalesOrderModalManager({ orders, customers, warehouses, products }: SalesOrderModalManagerProps) {
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
        router.refresh();
    };

    return (
        <>
            <SalesOrderCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                customers={customers}
                warehouses={warehouses}
                products={products}
                onSuccess={handleSuccess}
            />

            {selectedOrder && (
                <>
                    <SalesOrderEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        order={selectedOrder}
                        customers={customers}
                        warehouses={warehouses}
                        products={products}
                        onSuccess={handleSuccess}
                    />
                    <SalesOrderShowModal
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
