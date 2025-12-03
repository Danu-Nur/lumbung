"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Supplier } from "@prisma/client";
import { SupplierCreateModal } from "./supplier-create-modal";
import { SupplierEditModal } from "./supplier-edit-modal";
import { SupplierShowModal } from "./supplier-show-modal";

interface SupplierModalManagerProps {
    suppliers: Supplier[];
}

export function SupplierModalManager({ suppliers }: SupplierModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const modal = searchParams.get("modal");
    const id = searchParams.get("id");

    const createOpen = modal === "create";
    const editOpen = modal === "edit";
    const showOpen = modal === "show";

    const selectedSupplier = id ? suppliers.find((s) => s.id === id) : undefined;

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
            <SupplierCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                onSuccess={handleSuccess}
            />

            {selectedSupplier && (
                <>
                    <SupplierEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        supplier={selectedSupplier}
                        onSuccess={handleSuccess}
                    />
                    <SupplierShowModal
                        open={showOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        supplier={selectedSupplier}
                    />
                </>
            )}
        </>
    );
}
