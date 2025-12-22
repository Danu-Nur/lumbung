"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category } from "@prisma/client";
import { CategoryModal } from "./category-modal";
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

    const categoryModalOpen = modal === "create" || modal === "edit";
    const showOpen = modal === "show";

    const selectedCategory = id ? categories.find((c) => c.id === id) : null;

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
            <CategoryModal
                open={categoryModalOpen}
                onOpenChange={(open) => !open && handleClose()}
                category={modal === "edit" ? selectedCategory : null}
                onSuccess={handleSuccess}
            />

            {selectedCategory && (
                <CategoryShowModal
                    open={showOpen}
                    onOpenChange={(open) => !open && handleClose()}
                    category={selectedCategory}
                />
            )}
        </>
    );
}
