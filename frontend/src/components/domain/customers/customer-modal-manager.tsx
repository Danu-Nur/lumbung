"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Customer } from "@prisma/client";
import { CustomerCreateModal } from "./customer-create-modal";
import { CustomerEditModal } from "./customer-edit-modal";
import { CustomerShowModal } from "./customer-show-modal";

interface CustomerModalManagerProps {
    customers: Customer[];
}

export function CustomerModalManager({ customers }: CustomerModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const modal = searchParams.get("modal");
    const id = searchParams.get("id");

    const createOpen = modal === "create";
    const editOpen = modal === "edit";
    const showOpen = modal === "show";

    const selectedCustomer = id ? customers.find((c) => c.id === id) : undefined;

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
            <CustomerCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                onSuccess={handleSuccess}
            />

            {selectedCustomer && (
                <>
                    <CustomerEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        customer={selectedCustomer}
                        onSuccess={handleSuccess}
                    />
                    <CustomerShowModal
                        open={showOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        customer={selectedCustomer}
                    />
                </>
            )}
        </>
    );
}
