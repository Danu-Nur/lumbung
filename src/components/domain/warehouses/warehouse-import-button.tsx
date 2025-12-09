'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ImportModal } from '@/components/shared/import-modal';
import { importWarehouseBatch } from '@/features/warehouses/import-actions';

export function WarehouseImportButton() {
    const router = useRouter();

    return (
        <ImportModal
            type="warehouses"
            onImport={importWarehouseBatch}
            onSuccess={() => router.refresh()}
        />
    );
}
