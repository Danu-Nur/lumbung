'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { InventoryActions } from '@/components/domain/inventory/components/inventory-actions';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

// Export utils
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SerializedProduct } from '@/types/serialized';

interface InventoryTableProps {
    data: SerializedProduct[];
    warehouses: any[]; // Prop passed to actions
    suppliers: any[]; // Prop passed to actions
    onSuccess?: () => void;
}

export function InventoryTable({ data, warehouses, suppliers, onSuccess }: InventoryTableProps) {
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
            accessorKey: 'costPrice',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.costPrice')} />
            ),
            cell: ({ row }) => {
                const batches = row.original.inventoryItems;
                const activeBatches = batches.filter(b => b.quantityOnHand > 0);

                if (activeBatches.length === 0) {
                    return <span className="text-muted-foreground text-xs">{formatCurrency(row.original.costPrice)}</span>;
                }

                const prices = activeBatches.map(b => b.unitCost);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                if (minPrice === maxPrice) {
                    return <div className="font-medium">{formatCurrency(minPrice)}</div>;
                }

                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-xs text-blue-600">Range:</span>
                        <span className="text-xs font-bold">
                            {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'totalStock',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.totalStock')} className='justify-start' />
            ),
            cell: ({ row }) => {
                const stock = row.original.inventoryItems.reduce((acc, item) => acc + item.quantityOnHand, 0);
                const minStock = row.original.lowStockThreshold;
                const isLowStock = stock <= minStock;
                const isOutOfStock = stock <= 0;

                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isOutOfStock ? "bg-red-600 animate-pulse" : isLowStock ? "bg-amber-500" : "bg-emerald-500"}`} />
                        <div className="flex flex-col">
                            <span className={`text-sm ${isOutOfStock ? "text-red-700 font-bold" : isLowStock ? "text-amber-700 font-semibold" : "text-foreground font-medium"}`}>
                                {stock} {row.original.unit}
                            </span>
                            {isLowStock && (
                                <span className="text-[10px] text-muted-foreground leading-none">
                                    Min: {minStock}
                                </span>
                            )}
                        </div>
                        {isOutOfStock ? (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase font-bold">
                                Out
                            </Badge>
                        ) : isLowStock ? (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-bold border-amber-500 text-amber-600 bg-amber-50">
                                Low
                            </Badge>
                        ) : null}
                    </div>
                );
            },
        },
        {
            id: 'batches',
            header: () => <div className="text-sm font-semibold">{t('columns.warehouse')} / Batches</div>,
            cell: ({ row }) => {
                const batches = row.original.inventoryItems.filter(b => b.quantityOnHand > 0);
                if (batches.length === 0) return <span className="text-muted-foreground text-xs">-</span>;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                                {batches.length} Batches <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[300px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
                            <div className="bg-neo-blue text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b-2 border-black">
                                Stock Breakdown
                            </div>
                            <div className="max-h-[200px] overflow-auto">
                                <table className="w-full text-[11px]">
                                    <thead className="bg-gray-100 border-b border-black font-bold">
                                        <tr>
                                            <th className="px-2 py-1 text-left">Gudang</th>
                                            <th className="px-2 py-1 text-left">Modal</th>
                                            <th className="px-2 py-1 text-right">Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {batches.map((batch) => (
                                            <tr key={batch.id}>
                                                <td className="px-2 py-1.5">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{batch.warehouse?.name || 'Unknown Warehouse'}</span>
                                                        <span className="text-[9px] text-muted-foreground">{batch.supplier?.name || 'No Supplier'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1.5">{formatCurrency(batch.unitCost)}</td>
                                                <td className="px-2 py-1.5 text-right font-bold">{batch.quantityOnHand}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className='text-center'>
                    <InventoryActions
                        product={row.original}
                        warehouses={warehouses}
                        suppliers={suppliers}
                        onSuccess={onSuccess}
                    />
                </div>
            ),
            header: () => <div className="text-center">{tCommon('table.actions')}</div>
        },
    ], [t, tCommon, warehouses, suppliers]);

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
