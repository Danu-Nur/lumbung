"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category, Product, InventoryItem, Warehouse } from "@prisma/client";
import { InventoryCreateModal } from "./inventory-create-modal";
import { InventoryEditModal } from "./inventory-edit-modal";
import { InventoryShowModal } from "./inventory-show-modal";
import { InventoryStockModal } from "./inventory-stock-modal";
import { PurchaseOrderCreateModal } from "@/components/domain/purchase-orders/purchase-order-create-modal";

import { SerializedProduct } from "@/types/serialized";

interface InventoryModalManagerProps {
    products: SerializedProduct[];
    categories: Category[];
    warehouses: Warehouse[];
    suppliers?: { id: string; name: string }[];
    onSuccess?: () => void;
}

export function InventoryModalManager({ products, categories, warehouses, suppliers = [], onSuccess }: InventoryModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const modal = searchParams.get("modal");
    const id = searchParams.get("id");

    const createOpen = modal === "create";
    const editOpen = modal === "edit";
    const showOpen = modal === "show";
    const stockOpen = modal === "stock";
    const purchaseOpen = modal === "purchase";

    const selectedProduct = id ? products.find((p: SerializedProduct) => p.id === id) : undefined;

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("id");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSuccess = () => {
        handleClose();
        router.refresh();
        if (onSuccess) onSuccess();
    };

    return (
        <>
            <InventoryCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                categories={categories}
                warehouses={warehouses}
                suppliers={suppliers}
                onSuccess={handleSuccess}
            />

            {selectedProduct && (
                <>
                    <InventoryEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        product={selectedProduct}
                        categories={categories}
                        suppliers={suppliers}
                        onSuccess={handleSuccess}
                    />
                    <InventoryShowModal
                        open={showOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        product={selectedProduct}
                    />
                    <InventoryStockModal
                        open={stockOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        product={selectedProduct}
                        warehouses={warehouses}
                        onSuccess={handleSuccess}
                    />
                </>
            )}
            <PurchaseOrderCreateModal
                open={purchaseOpen}
                initialProductId={id || undefined}
                products={products.map(p => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    costPrice: p.costPrice,
                    supplierId: p.supplier?.id
                }))}
                suppliers={suppliers}
                warehouses={warehouses}
                onOpenChange={(open) => !open && handleClose()}
                onSuccess={handleSuccess}
            />
        </>
    );
}
