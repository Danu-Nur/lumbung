"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    onSuccess?: () => void;
}

import { AdjustmentRowModal } from "@/components/domain/adjustments/adjustment-row-modal";

export function InventoryActions({ product, warehouses, onSuccess }: InventoryActionsProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [adjustmentOpen, setAdjustmentOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations("inventory");
    const tCommon = useTranslations("common");

    const isDeletingRef = useRef(false);

    const handleDelete = async () => {
        if (isDeletingRef.current) return;
        isDeletingRef.current = true;
        setLoading(true);
        try {
            await deleteProduct(product.id);
            toast.success(tCommon("actions.deleteSuccess"));
            setDeleteOpen(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || tCommon("actions.deleteError"));
        } finally {
            setLoading(false);
            isDeletingRef.current = false;
        }
    };



    return (
        <div className="flex items-center gap-2 justify-center">
            <ActionColumn
                onView={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('modal', 'show');
                    params.set('id', product.id);
                    router.push(`?${params.toString()}`, { scroll: false });
                }}
                onEdit={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('modal', 'edit');
                    params.set('id', product.id);
                    router.push(`?${params.toString()}`, { scroll: false });
                }}
                onDelete={() => setDeleteOpen(true)}
                customActions={[
                    {
                        label: t("stock.adjustment"),
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
                onSuccess={onSuccess}
            />
        </div>
    );
}
