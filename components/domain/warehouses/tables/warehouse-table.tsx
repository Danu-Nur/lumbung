'use client';

import { useMemo } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Warehouse } from '@prisma/client';
import { WarehouseActions } from '../warehouse-actions';
import { useTranslations } from 'next-intl';

interface WarehouseTableProps {
    data: (Warehouse & {
        _count: {
            inventoryItems: number;
        };
    })[];
}

export function WarehouseTable({ data }: WarehouseTableProps) {
    const t = useTranslations('warehouses.columns');
    const tCommon = useTranslations('common');

    const columns: ColumnDef<Warehouse & { _count: { inventoryItems: number } }>[] = useMemo(() => [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('name')} />
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'code',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('code')} />
            ),
        },
        {
            id: 'location',
            accessorFn: (row) => row.city || row.address || '-',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('location')} />
            ),
        },
        {
            accessorKey: '_count.inventoryItems',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('items')} className='justify-end' />
            ),
            cell: ({ row }) => <div className="text-right">{row.original._count.inventoryItems}</div>,
        },
        {
            accessorKey: 'isActive',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('status')} />
            ),
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-center">{tCommon('table.actions')}</div>,
            cell: ({ row }) => <div className="text-center"><WarehouseActions warehouse={row.original} /></div>,
        },
    ], [t, tCommon]);

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder={tCommon('buttons.search') + "..."}
        />
    );
}
