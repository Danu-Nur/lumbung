'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface SearchInputProps {
    placeholder?: string;
    className?: string;
}

export function SearchInput({ placeholder, className }: SearchInputProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        // Reset to page 1 when searching
        params.set('page', '1');

        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className={`relative flex-1 max-w-sm ${className}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeholder || 'Search...'}
                className="pl-8"
                defaultValue={searchParams.get('q')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
            />
        </div>
    );
}
