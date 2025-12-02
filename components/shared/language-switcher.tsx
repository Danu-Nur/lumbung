'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('common.buttons');

    const handleLocaleChange = (newLocale: string) => {
        // Construct new path by replacing the locale segment
        // pathname is like /en/dashboard or /id/dashboard
        const segments = pathname.split('/');
        segments[1] = newLocale;
        const newPath = segments.join('/');
        router.replace(newPath);
    };

    return (
        <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="w-fit h-9">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="id">ID</SelectItem>
            </SelectContent>
        </Select>
    );
}
