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

interface HelpSheetProps {
    title: string;
    children: React.ReactNode;
}

export function HelpSheet({ title, children }: HelpSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Open Help</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Help: {title}</SheetTitle>
                    <SheetDescription>
                        Guide and documentation for this page.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 text-sm leading-relaxed">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}
