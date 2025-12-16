"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category } from "@prisma/client";
import { CategoryCreateModal } from "./category-create-modal";
import { CategoryEditModal } from "./category-edit-modal";
import { CategoryShowModal } from "./category-show-modal";

interface CategoryModalManagerProps {
    categories: Category[];
}

export function CategoryModalManager({ categories }: CategoryModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const modal = searchParams.get("modal");
    const id = searchParams.get("id");

    const createOpen = modal === "create";
    const editOpen = modal === "edit";
    const showOpen = modal === "show";

    const selectedCategory = id ? categories.find((c) => c.id === id) : undefined;

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
            <CategoryCreateModal
                open={createOpen}
                onOpenChange={(open) => !open && handleClose()}
                onSuccess={handleSuccess}
            />

            {selectedCategory && (
                <>
                    <CategoryEditModal
                        open={editOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        category={selectedCategory}
                        onSuccess={handleSuccess}
                    />
                    <CategoryShowModal
                        open={showOpen}
                        onOpenChange={(open) => !open && handleClose()}
                        category={selectedCategory}
                    />
                </>
            )}
        </>
    );
}
