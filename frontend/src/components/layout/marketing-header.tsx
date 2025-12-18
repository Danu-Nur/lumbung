'use client';

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, Package2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
    { title: "common.nav.pricing", href: "/pricing" },
    { title: "common.nav.about", href: "/about" },
];

export function MarketingHeader() {
    const t = useTranslations();
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b-4 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* FIX: mx-auto dan justify-between agar rata tengah & ada spasi */}
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

                {/* 1. Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 border-2 border-border bg-background p-2 shadow-[4px_4px_0px_0px_var(--brutal-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--brutal-shadow)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                        <Package2 className="h-6 w-6" />
                        <span className="font-bold text-lg hidden sm:inline-block">
                            Lumbung
                        </span>
                    </Link>
                    <nav className="flex items-center gap-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "text-sm font-bold px-4 py-2 border-2 transition-all active:translate-y-0 active:shadow-none",
                                        isActive
                                            ? "border-border bg-accent shadow-[4px_4px_0px_0px_var(--brutal-shadow)] -translate-y-1"
                                            : "border-transparent hover:border-border hover:bg-accent hover:shadow-[4px_4px_0px_0px_var(--brutal-shadow)] hover:-translate-y-1"
                                    )}
                                >
                                    {t(item.title)}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* 2. Mobile Navigation (Hamburger) */}
                <div className="flex md:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="pr-0">
                            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                            <SheetDescription className="sr-only">Navigation</SheetDescription>
                            <Link href="/" className="flex items-center space-x-2 mb-6" onClick={() => setOpen(false)}>
                                <Package2 className="h-6 w-6" />
                                <span className="font-bold">Lumbung</span>
                            </Link>
                            <div className="flex flex-col space-y-3 pl-2 mb-3">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                "transition-colors hover:text-foreground",
                                                isActive ? "text-foreground font-bold" : "text-foreground/70"
                                            )}
                                        >
                                            {t(item.title)}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col gap-4 pl-2">
                                <div className="flex items-center gap-4">
                                    <ThemeToggle />
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* 3. Actions (Login/Register) */}
                <div className="flex items-center gap-2">
                    <nav className="flex items-center gap-2">
                        {/* Language Switcher & Theme Toggle - Hide on Mobile */}
                        <div className="hidden md:flex items-center gap-2">
                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>

                        <Link href="/login">
                            <Button variant="success" size="sm">
                                {t('common.buttons.login')}
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">
                                {t('Landing.hero.getStarted')}
                            </Button>
                        </Link>

                    </nav>
                </div>
            </div>
        </header>
    );
}
