'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { InventoryActions } from '@/components/domain/inventory/inventory-actions'; // Existing actions
import { useTranslations } from 'next-intl';

// Export utils
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SerializedProduct } from '@/types/serialized';

interface InventoryTableProps {
    data: SerializedProduct[];
    warehouses: any[]; // Prop passed to actions
}

export function InventoryTable({ data, warehouses }: InventoryTableProps) {
    const t = useTranslations('inventory');
    const tCommon = useTranslations('common');

    // Columns Definition
    const columns: ColumnDef<SerializedProduct>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.product')} />
            ),
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-foreground">{row.getValue('name')}</p>
                    {row.original.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{row.original.description}</p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'sku',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.sku')} />
            ),
        },
        {
            accessorKey: 'category.name', // Access nested
            id: 'category',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.category')} />
            ),
            cell: ({ row }) => row.original.category?.name || '-',
        },
        {
            accessorKey: 'sellingPrice',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.sellingPrice')} className='justify-end' />
            ),
            cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue('sellingPrice'))}</div>,
        },
        {
            accessorKey: 'totalStock', // Custom accessor for calculation? Or use cell
            id: 'totalStock',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.totalStock')} className='justify-end' />
            ),
            cell: ({ row }) => {
                const totalStock = row.original.inventoryItems.reduce((acc, item) => acc + item.quantityOnHand, 0);
                const isLow = totalStock <= row.original.lowStockThreshold;
                return (
                    <div className="text-right">
                        <Badge variant={isLow ? 'destructive' : 'default'}>
                            {totalStock} {row.original.unit}
                        </Badge>
                    </div>
                )
            },
            accessorFn: (row) => row.inventoryItems.reduce((acc, item) => acc + item.quantityOnHand, 0), // Enable sorting by stock
        },
        {
            id: 'actions',
            cell: ({ row }) => <div className='text-center'><InventoryActions product={row.original} warehouses={warehouses} /></div>,
            header: () => <div className="text-center">{tCommon('table.actions')}</div>
        },
    ];

    // Export Handlers
    // Export Handlers
    const handleExportExcel = (rows: SerializedProduct[]) => {
        const exportData = rows.map(row => ({
            [t('columns.product')]: row.name,
            [t('columns.sku')]: row.sku,
            [t('columns.category')]: row.category?.name || '-',
            [t('columns.sellingPrice')]: row.sellingPrice,
            [t('columns.totalStock')]: row.inventoryItems.reduce((acc, item) => acc + item.quantityOnHand, 0),
            [t('columns.unit')]: row.unit,
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, t('title'));
        XLSX.writeFile(wb, `inventory_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleExportPdf = (rows: SerializedProduct[]) => {
        const doc = new jsPDF();
        const tableData = rows.map(row => [
            row.name,
            row.sku,
            row.category?.name || '-',
            formatCurrency(row.sellingPrice),
            row.inventoryItems.reduce((acc, item) => acc + item.quantityOnHand, 0) + ' ' + row.unit
        ]);

        autoTable(doc, {
            head: [[
                t('columns.product'),
                t('columns.sku'),
                t('columns.category'),
                t('columns.sellingPrice'),
                t('columns.totalStock')
            ]],
            body: tableData,
        });
        doc.save(`inventory_export_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const handlePrint = (rows: SerializedProduct[]) => {
        // Simple window print or creating a print window. 
        // For better experience, we can use a print stylesheet or a dedicated print component. 
        // Using basic window.print() usually prints the viewing page. 
        // To print *just* the table, we might need a hidden print area. 
        // For now, let's just trigger window.print() but maybe users expect a report format.
        // A better approach is often generating a PDF in a new tab to print.
        // Let's reuse PDF generation blob to open in new tab? 
        // Or simpler: just window.print() and rely on CSS @media print to hide sidebar/etc (Global enhancement).
        window.print();
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder={tCommon('buttons.search') + "..."}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            onDelete={(rows) => {
                console.log("Deleting rows", rows);
                // Would implement batch delete server action here
                alert(tCommon("actions.comingSoon"));
            }}
        />
    );
}
