'use client';

import { Table } from '@tanstack/react-table';
import { X, FileSpreadsheet, FileText, Printer, Trash, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Inline definition used below
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Icon replaced with Lucide Settings2

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    searchKey?: string;
    searchPlaceholder?: string;
    onExportExcel?: () => void;
    onExportPdf?: () => void;
    onPrint?: () => void;
    onDelete?: () => void;
}

export function DataTableToolbar<TData>({
    table,
    searchKey,
    searchPlaceholder,
    onExportExcel,
    onExportPdf,
    onPrint,
    onDelete,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const selectedRows = table.getFilteredSelectedRowModel().rows.length;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {searchKey && (
                    <Input
                        placeholder={searchPlaceholder || "Filter..."}
                        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex items-center space-x-2">
                {selectedRows > 0 && onDelete && (
                    <Button variant="destructive" size="sm" className="h-8" onClick={onDelete}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete ({selectedRows})
                    </Button>
                )}

                {onExportExcel && (
                    <Button variant="outline" size="sm" className="h-8 hidden sm:flex" onClick={onExportExcel}>
                        <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                        Excel
                    </Button>
                )}

                {onExportPdf && (
                    <Button variant="outline" size="sm" className="h-8 hidden sm:flex" onClick={onExportPdf}>
                        <FileText className="mr-2 h-4 w-4 text-red-600" />
                        PDF
                    </Button>
                )}

                {onPrint && (
                    <Button variant="outline" size="sm" className="h-8 hidden sm:flex" onClick={onPrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                )}

                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}

// Inline ViewOptions for simplicity in this file for now or split if preferred. 
// Splitting is better for the User's "Global" request.
function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto hidden h-8 lg:flex"
                >
                    <Settings2 className="mr-2 h-4 w-4" />
                    View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                    .getAllColumns()
                    .filter(
                        (column) =>
                            typeof column.accessorFn !== "undefined" && column.getCanHide()
                    )
                    .map((column) => {
                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                {column.id}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
