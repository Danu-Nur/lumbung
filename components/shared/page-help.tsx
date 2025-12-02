'use client';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';

interface HelpSection {
    heading: string;
    content: React.ReactNode;
}

interface PageHelpProps {
    title: string;
    sections: HelpSection[];
}

export function PageHelp({ title, sections }: PageHelpProps) {
    const t = useTranslations('common.help');

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-5 w-5" />
                    {/* <span className="hidden sm:inline">Panduan</span> */}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-[400px] p-0">
                <ScrollArea className="h-full">
                    <div className="p-6">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-xl">{t('title', { title })}</SheetTitle>
                            <SheetDescription>
                                {t('description')}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-6">
                            {sections.map((section, index) => (
                                <div key={index} className="space-y-3">
                                    <h3 className="font-semibold text-foreground text-lg border-b pb-2">
                                        {section.heading}
                                    </h3>
                                    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                                        {section.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
