"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SerializedProduct } from "@/types/serialized";
import { deleteProduct } from "@/features/inventory/actions";
import { ActionColumn } from "@/components/shared/action-column";
import { DeleteConfirmationModal } from "@/components/shared/delete-confirmation-modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ClipboardList } from "lucide-react";

interface InventoryActionsProps {
    product: SerializedProduct;
    warehouses: Array<{ id: string; name: string }>;
}

import { AdjustmentRowModal } from "@/components/domain/adjustments/adjustment-row-modal";

export function InventoryActions({ product, warehouses }: InventoryActionsProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [adjustmentOpen, setAdjustmentOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const t = useTranslations("inventory");
    const tCommon = useTranslations("common");

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteProduct(product.id);
            toast.success(tCommon("actions.deleteSuccess"));
            setDeleteOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || tCommon("actions.deleteError"));
        } finally {
            setLoading(false);
        }
    };

    const handleView = () => {
        router.push(`?modal=show&id=${product.id}`, { scroll: false });
    };

    const handleEdit = () => {
        router.push(`?modal=edit&id=${product.id}`, { scroll: false });
    };

    return (
        <div className="flex items-center gap-2 justify-center">
            <ActionColumn
                onView={handleView}
                onEdit={handleEdit}
                onDelete={() => setDeleteOpen(true)}
                customActions={[
                    {
                        label: t("title"),
                        onClick: () => setAdjustmentOpen(true),
                        icon: <ClipboardList className="h-4 w-4" />
                    }
                ]}
            />
            <DeleteConfirmationModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                loading={loading}
                title={tCommon("actions.deleteConfirmTitle")}
                description={tCommon("actions.deleteConfirmDescription", { name: product.name })}
            />
            <AdjustmentRowModal
                open={adjustmentOpen}
                onOpenChange={setAdjustmentOpen}
                product={product}
                warehouses={warehouses}
            />
        </div>
    );
}
