'use client';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize?: number;
    totalItems?: number;
    baseUrl?: string;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize = 10,
    totalItems,
    baseUrl,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('common.pagination');

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        if (pageSize) {
            params.set('pageSize', pageSize.toString());
        }
        return `${baseUrl || ''}?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        } else {
            router.push(createPageURL(page));
        }
    };

    const handlePageSizeChange = (value: string) => {
        const newSize = parseInt(value);
        if (onPageSizeChange) {
            onPageSizeChange(newSize);
        } else {
            const params = new URLSearchParams(searchParams);
            params.set('pageSize', newSize.toString());
            params.set('page', '1'); // Reset to page 1
            router.push(`${baseUrl || ''}?${params.toString()}`);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {totalItems !== undefined && (
                <div className="text-sm text-muted-foreground">
                    {t('showing', {
                        from: Math.min((currentPage - 1) * pageSize + 1, totalItems),
                        to: Math.min(currentPage * pageSize, totalItems),
                        total: totalItems
                    })}
                </div>
            )}
            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{t('rowsPerPage')}</p>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={handlePageSizeChange}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize.toString()} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    {t('pageOf', { current: currentPage, total: totalPages })}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    >
                        <span className="sr-only">{t('first')}</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <span className="sr-only">{t('previous')}</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <span className="sr-only">{t('next')}</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <span className="sr-only">{t('last')}</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
