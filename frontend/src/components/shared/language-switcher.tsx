'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();
    const t = useTranslations('common.buttons');

    const handleLocaleChange = (newLocale: string) => {
        const queryString = searchParams.toString();
        const path = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(path, { locale: newLocale });
    };

    return (
        <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="w-fit h-9 px-4 font-bold rounded-none border-2 border-border shadow-[4px_4px_0px_0px_var(--brutal-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--brutal-shadow)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:border-white dark:shadow-[4px_4px_0px_0px_#ffffff] dark:hover:shadow-[2px_2px_0px_0px_#ffffff] bg-transparent hover:bg-accent hover:text-accent-foreground dark:bg-black dark:text-white transition-all focus:ring-0">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_var(--brutal-shadow)] dark:border-white dark:shadow-[4px_4px_0px_0px_#ffffff] bg-background">
                <SelectItem value="en" className="focus:bg-accent focus:text-accent-foreground font-bold">EN</SelectItem>
                <SelectItem value="id" className="focus:bg-accent focus:text-accent-foreground font-bold">ID</SelectItem>
            </SelectContent>
        </Select>
    );
}
