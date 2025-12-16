"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { UserCreateModal } from "./user-create-modal";
import { UserEditModal } from "./user-edit-modal";
import { UserShowModal } from "./user-show-modal";
import { UserWithRole } from "@/types/serialized";

interface UserModalManagerProps {
    roles: { id: string; name: string }[];
    users?: UserWithRole[]; // Pass users to find the selected one
}

export function UserModalManager({ roles, users = [] }: UserModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const modal = searchParams.get("modal");
    const id = searchParams.get("id");

    const createOpen = modal === "create";
    const editOpen = modal === "edit";
    const showOpen = modal === "show";

    const selectedUser = id ? users.find((u) => u.id === id) : undefined;

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
            <UserCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                roles={roles}
                onSuccess={handleSuccess}
            />

            {selectedUser && (
                <>
                    <UserEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        user={selectedUser}
                        roles={roles}
                        onSuccess={handleSuccess}
                    />
                    <UserShowModal
                        open={showOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        user={selectedUser}
                    />
                </>
            )}
        </>
    );
}
