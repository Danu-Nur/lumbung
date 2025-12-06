"use client";

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { SerializedStockOpname } from '@/types/serialized';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';

interface OpnameTableProps {
    data: SerializedStockOpname[];
}

export function OpnameTable({ data }: OpnameTableProps) {
    const t = useTranslations('opname');
    const tCommon = useTranslations('common');

    const columns: ColumnDef<SerializedStockOpname>[] = [
        {
            accessorKey: 'opnameNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.opnameNumber')} />,
            cell: ({ row }) => <span className="font-medium font-mono">{row.getValue('opnameNumber')}</span>,
        },
        {
            accessorKey: 'warehouse.name',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.warehouse')} />,
        },
        {
            accessorKey: 'date',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.date')} />,
            cell: ({ row }) => formatDate(row.getValue('date')),
        },
        {
            accessorKey: 'items',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.progress')} className='justify-end' />,
            cell: ({ row }) => {
                const items = row.original.items || [];
                const counted = items.filter(i => i.actualQty !== null).length;
                const total = items.length;
                return <div className="text-right">{counted} / {total}</div>;
            }
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                let colorClass = 'bg-slate-100 text-slate-700';
                if (status === 'IN_PROGRESS') colorClass = 'bg-blue-100 text-blue-700';
                if (status === 'COMPLETED') colorClass = 'bg-green-100 text-green-700';
                if (status === 'CANCELLED') colorClass = 'bg-red-100 text-red-700';

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                        {t(`status.${status}`)}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="text-right">
                    <Link href={`/inventory/opname/${row.original.id}`}>
                        <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            {tCommon('buttons.view')}
                        </Button>
                    </Link>
                </div>
            ),
            header: () => <div className="text-right">{tCommon('table.actions')}</div>
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="opnameNumber"
            searchPlaceholder={t('columns.opnameNumber') + "..."}
        />
    );
}
