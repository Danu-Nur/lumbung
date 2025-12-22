"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Warehouse } from "@prisma/client";
import { WarehouseModal } from "./warehouse-modal";
import { WarehouseShowModal } from "./warehouse-show-modal";

interface WarehouseModalManagerProps {
    warehouses: Warehouse[];
}

export function WarehouseModalManager({ warehouses }: WarehouseModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const modal = searchParams.get("modal");
    const id = searchParams.get("id");

    const warehouseModalOpen = modal === "create" || modal === "edit";
    const showOpen = modal === "show";

    const selectedWarehouse = id ? warehouses.find((w) => w.id === id) : null;

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
            <WarehouseModal
                open={warehouseModalOpen}
                onOpenChange={(open) => !open && handleClose()}
                warehouse={modal === "edit" ? selectedWarehouse : null}
                onSuccess={handleSuccess}
            />

            {selectedWarehouse && (
                <WarehouseShowModal
                    open={showOpen}
                    onOpenChange={(open) => !open && handleClose()}
                    warehouse={selectedWarehouse}
                />
            )}
        </>
    );
}
