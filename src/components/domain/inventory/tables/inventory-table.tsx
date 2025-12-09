'use client';

import { useMemo } from 'react';
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
    const columns: ColumnDef<SerializedProduct>[] = useMemo(() => [
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
                <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[200px]" title={row.getValue('name')}>
                        {row.getValue('name')}
                    </span>
                    <span className="text-xs text-muted-foreground">{row.original.sku}</span>
                </div>
            ),
        },
        {
            accessorKey: 'category',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.category')} />
            ),
            cell: ({ row }) => {
                const category = row.original.category;
                return (
                    <div className="flex items-center">
                        {category ? (
                            <Badge variant="outline" className="text-xs">
                                {category.name}
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'sellingPrice',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.sellingPrice')} className='justify-end' />
            ),
            cell: ({ row }) => {
                const formattedPrice = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(row.getValue('sellingPrice'));
                return <div className="font-medium">{formattedPrice}</div>;
            },
        },
        {
            accessorKey: 'totalStock',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.totalStock')} className='justify-end' />
            ),
            cell: ({ row }) => {
                const stock = row.getValue('totalStock') as number;
                const minStock = row.original.lowStockThreshold;
                const isLowStock = stock <= minStock;

                return (
                    <div className="flex items-center gap-2">
                        <span className={isLowStock ? "text-destructive font-bold" : ""}>
                            {stock} {row.original.unit}
                        </span>
                        {isLowStock && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                Low
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'warehouse',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.warehouse')} />
            ),
            cell: ({ row }) => {
                const stock = row.original.inventoryItems;
                if (!stock || stock.length === 0) return <span className="text-muted-foreground">-</span>;

                // Show first warehouse and count of others
                const firstWarehouse = stock[0].warehouse.name;
                const otherCount = stock.length - 1;

                return (
                    <div className="flex flex-col text-xs">
                        <span>{firstWarehouse}</span>
                        {otherCount > 0 && (
                            <span className="text-muted-foreground">+{otherCount} others</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => <div className='text-center'><InventoryActions product={row.original} warehouses={warehouses} /></div>,
            header: () => <div className="text-center">{tCommon('table.actions')}</div>
        },
    ], [t, tCommon, warehouses]);

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
                alert(tCommon("actions.comingSoon"));
            }}
        />
    );
}
