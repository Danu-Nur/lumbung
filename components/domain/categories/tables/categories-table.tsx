'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header';
import { CategoryActions } from '@/components/domain/categories/category-actions';
import { useTranslations } from 'next-intl';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SerializedCategory } from '@/types/serialized';

interface CategoriesTableProps {
    data: SerializedCategory[];
}

export function CategoriesTable({ data }: CategoriesTableProps) {
    const t = useTranslations('categories');
    const tCommon = useTranslations('common');

    const columns: ColumnDef<SerializedCategory>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'description',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
        },
        {
            id: 'actions',
            cell: ({ row }) => <div className="text-right"><CategoryActions category={row.original} /></div>,
            header: () => <div className="text-right">{tCommon('table.actions')}</div>
        }
    ];

    const handleExportExcel = (rows: SerializedCategory[]) => {
        const exportData = rows.map(row => ({
            [t('columns.name')]: row.name,
            [t('columns.description')]: row.description,
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Categories");
        XLSX.writeFile(wb, `categories_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleExportPdf = (rows: SerializedCategory[]) => {
        const doc = new jsPDF();
        const tableData = rows.map(row => [
            row.name,
            row.description,
        ]);

        autoTable(doc, {
            head: [[t('columns.name'), t('columns.description')]],
            body: tableData,
        });
        doc.save(`categories_export_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder={t('columns.name') + "..."}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={() => window.print()}
        />
    );
}
