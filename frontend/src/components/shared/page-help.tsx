"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface PageHelpProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function PageHelp({ title, description, children }: PageHelpProps) {
    const t = useTranslations("common");

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">{t("help.buttonLabel")}</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        {title}
                    </SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}
