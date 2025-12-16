'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header';
import { TransferActions } from '@/components/domain/transfers/transfer-actions';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SerializedStockTransfer } from '@/types/serialized';

interface TransferTableProps {
    data: SerializedStockTransfer[];
}

export function TransferTable({ data }: TransferTableProps) {
    const t = useTranslations('transfers');
    const tCommon = useTranslations('common');

    const columns: ColumnDef<SerializedStockTransfer>[] = [
        {
            accessorKey: 'transferNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.reference')} />,
            cell: ({ row }) => <span className="font-medium">{row.getValue('transferNumber')}</span>,
        },
        {
            accessorKey: 'fromWarehouse.name',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.from')} />,
        },
        {
            accessorKey: 'toWarehouse.name',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.to')} />,
        },
        {
            accessorKey: 'transferDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.date')} />,
            cell: ({ row }) => formatDate(row.getValue('transferDate')),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
            cell: ({ row }) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.getValue('status') === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                    row.getValue('status') === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                        row.getValue('status') === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                    }`}>
                    {t(`status.${row.getValue('status')}`)}
                </span>
            ),
        },
        {
            id: 'items',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.items')} className='justify-end' />,
            cell: ({ row }) => <div className="text-right">{row.original.items ? row.original.items.length : 0}</div>,
        },
        {
            id: 'actions',
            cell: ({ row }) => <div className="text-center"><TransferActions transfer={row.original} /></div>,
            header: () => <div className="text-center">{tCommon('table.actions')}</div>
        }
    ];

    const handleExportExcel = (rows: SerializedStockTransfer[]) => {
        const exportData = rows.map(row => ({
            [t('columns.reference')]: row.transferNumber,
            [t('columns.from')]: row.fromWarehouse.name,
            [t('columns.to')]: row.toWarehouse.name,
            [t('columns.date')]: formatDate(row.transferDate),
            [t('columns.status')]: t(`status.${row.status}`),
            [t('columns.items')]: row.items ? row.items.length : 0
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transfers");
        XLSX.writeFile(wb, `transfers_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleExportPdf = (rows: SerializedStockTransfer[]) => {
        const doc = new jsPDF();
        const tableData = rows.map(row => [
            row.transferNumber,
            row.fromWarehouse.name,
            row.toWarehouse.name,
            formatDate(row.transferDate),
            t(`status.${row.status}`),
            row.items ? row.items.length : 0
        ]);

        autoTable(doc, {
            head: [[t('columns.reference'), t('columns.from'), t('columns.to'), t('columns.date'), t('columns.status'), t('columns.items')]],
            body: tableData,
        });
        doc.save(`transfers_export_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="transferNumber"
            searchPlaceholder={t('columns.reference') + "..."}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={() => window.print()}
        />
    );
}
