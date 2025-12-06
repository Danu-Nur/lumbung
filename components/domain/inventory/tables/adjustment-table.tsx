'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header';
import { AdjustmentActions } from '@/components/domain/adjustments/adjustment-actions';
import { formatDateTime } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SerializedStockAdjustment } from '@/types/serialized';

export function AdjustmentTable({ data }: { data: SerializedStockAdjustment[] }) {
    const t = useTranslations('inventory');
    const tCommon = useTranslations('common');

    const columns: ColumnDef<SerializedStockAdjustment>[] = [
        {
            accessorKey: 'createdAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.date')} />,
            cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateTime(row.getValue('createdAt'))}</span>,
        },
        {
            accessorKey: 'product.name',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.product')} />,
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.product.name}</p>
                    <p className="text-sm text-muted-foreground">{row.original.product.sku}</p>
                </div>
            )
        },
        {
            accessorKey: 'warehouse.name',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.warehouse')} />,
        },
        {
            accessorKey: 'adjustmentType',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
            cell: ({ row }) => (
                <Badge variant={row.getValue('adjustmentType') === 'increase' ? 'default' : 'destructive'}>
                    {row.getValue('adjustmentType')}
                </Badge>
            )
        },
        {
            accessorKey: 'quantity',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.quantity')} className='justify-end' />,
            cell: ({ row }) => (
                <div className={`text-right font-bold ${row.original.adjustmentType === 'increase' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.original.adjustmentType === 'increase' ? '+' : '-'}{row.getValue('quantity')}
                </div>
            )
        },
        {
            accessorKey: 'reason',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.reason')} />,
        },
        {
            accessorKey: 'createdBy.name',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.by')} />,
        },
        {
            id: 'actions',
            cell: ({ row }) => <div className="text-right"><AdjustmentActions adjustment={row.original} /></div>,
            header: () => <div className="text-right">{tCommon('table.actions')}</div>
        }
    ];

    const handleExportExcel = (rows: SerializedStockAdjustment[]) => {
        const exportData = rows.map(row => ({
            Date: formatDateTime(row.createdAt),
            Product: row.product.name,
            Warehouse: row.warehouse.name,
            Type: row.adjustmentType,
            Quantity: row.quantity,
            Reason: row.reason,
            By: row.createdBy.name
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Adjustments");
        XLSX.writeFile(wb, `adjustments_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleExportPdf = (rows: SerializedStockAdjustment[]) => {
        const doc = new jsPDF();
        const tableData = rows.map(row => [
            formatDateTime(row.createdAt),
            row.product.name,
            row.warehouse.name,
            row.adjustmentType,
            row.quantity,
            row.reason,
            row.createdBy.name
        ]);

        autoTable(doc, {
            head: [['Date', 'Product', 'Warehouse', 'Type', 'Qty', 'Reason', 'By']],
            body: tableData,
        });
        doc.save(`adjustments_export_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="reason"
            searchPlaceholder={t('columns.reason') + "..."}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={() => window.print()}
        />
    );
}
