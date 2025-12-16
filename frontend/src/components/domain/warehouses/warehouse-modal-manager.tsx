"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Warehouse } from "@prisma/client";
import { WarehouseCreateModal } from "./warehouse-create-modal";
import { WarehouseEditModal } from "./warehouse-edit-modal";
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

    const createOpen = modal === "create";
    const editOpen = modal === "edit";
    const showOpen = modal === "show";

    const selectedWarehouse = id ? warehouses.find((w) => w.id === id) : undefined;

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
            <WarehouseCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                onSuccess={handleSuccess}
            />

            {selectedWarehouse && (
                <>
                    <WarehouseEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        warehouse={selectedWarehouse}
                        onSuccess={handleSuccess}
                    />
                    <WarehouseShowModal
                        open={showOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        warehouse={selectedWarehouse}
                    />
                </>
            )}
        </>
    );
}
