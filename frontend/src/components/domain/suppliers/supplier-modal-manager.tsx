"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Supplier } from "@prisma/client";
import { SupplierModal } from "./supplier-modal";
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

    const supplierModalOpen = modal === "create" || modal === "edit";
    const showOpen = modal === "show";

    const selectedSupplier = id ? suppliers.find((s) => s.id === id) : null;

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
            <SupplierModal
                open={supplierModalOpen}
                onOpenChange={(open) => !open && handleClose()}
                supplier={modal === "edit" ? selectedSupplier : null}
                onSuccess={handleSuccess}
            />

            {selectedSupplier && (
                <SupplierShowModal
                    open={showOpen}
                    onOpenChange={(open) => !open && handleClose()}
                    supplier={selectedSupplier}
                />
            )}
        </>
    );
}
