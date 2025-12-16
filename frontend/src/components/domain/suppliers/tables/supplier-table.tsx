'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { SupplierActions } from '@/components/domain/suppliers/supplier-actions';
import { useTranslations } from 'next-intl';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SerializedSupplier } from '@/types/serialized';

interface SupplierTableProps {
    data: SerializedSupplier[];
}

export function SupplierTable({ data }: SupplierTableProps) {
    const t = useTranslations('suppliers');
    const tCommon = useTranslations('common');

    const columns: ColumnDef<SerializedSupplier>[] = useMemo(() => [
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
                <DataTableColumnHeader column={column} title={t('columns.name')} />
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.email')} />
            ),
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('email') || '-'}</div>,
        },
        {
            accessorKey: 'phone',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.phone')} />
            ),
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('phone') || '-'}</div>,
        },
        {
            accessorKey: 'city',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('columns.city')} />
            ),
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('city') || '-'}</div>,
        },
        {
            id: 'actions',
            cell: ({ row }) => <div className="text-center"><SupplierActions supplier={row.original} /></div>,
            header: () => <div className="text-center">{tCommon('table.actions')}</div>
        },
    ], [t, tCommon]);

    // Export Handlers
    const handleExportExcel = (rows: SerializedSupplier[]) => {
        const exportData = rows.map(row => ({
            [t('columns.name')]: row.name,
            [t('columns.email')]: row.email || '-',
            [t('columns.phone')]: row.phone || '-',
            [t('columns.city')]: row.city || '-',
            [t('columns.address')]: row.address || '-',
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
        XLSX.writeFile(wb, `suppliers_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleExportPdf = (rows: SerializedSupplier[]) => {
        const doc = new jsPDF();
        const tableData = rows.map(row => [
            row.name,
            row.email || '-',
            row.phone || '-',
            row.city || '-',
        ]);

        autoTable(doc, {
            head: [[
                t('columns.name'),
                t('columns.email'),
                t('columns.phone'),
                t('columns.city')
            ]],
            body: tableData,
        });
        doc.save(`suppliers_export_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder={tCommon('buttons.search') + "..."}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={() => window.print()}
        />
    );
}
