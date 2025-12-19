'use client';

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, ShoppingCart } from "lucide-react";
import { BrandLogo } from "./brand-logo";

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

interface MarketingHeaderProps {
    simple?: boolean;
}

export function MarketingHeader({ simple = false }: MarketingHeaderProps) {
    const t = useTranslations();
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b-4 border-black dark:border-white bg-white dark:bg-black">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">

                {/* 1. Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <BrandLogo />
                    {!simple && (
                        <nav className="flex items-center gap-4">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "text-sm font-bold px-4 py-2 border-2 transition-all active:translate-y-0 active:shadow-none uppercase tracking-wide",
                                            isActive
                                                ? "border-black dark:border-white bg-neutral-200 dark:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] -translate-y-1"
                                                : "border-transparent hover:border-black dark:hover:border-white hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1"
                                        )}
                                    >
                                        {t(item.title)}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}
                </div>

                {/* 2. Mobile Navigation (Hamburger) - Hide completely in simple mode if desired, or just simplify content */}
                {!simple && (
                    <div className="flex w-full md:hidden items-center gap-4">
                        <BrandLogo variant="flat" />

                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="border-2 border-black dark:border-white rounded-none ml-auto">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="pr-0 border-r-4 border-black dark:border-white bg-white dark:bg-black">
                                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                                <SheetDescription className="sr-only">Navigation</SheetDescription>
                                <BrandLogo
                                    className="mb-8 w-fit"
                                    onClick={() => setOpen(false)}
                                />
                                <div className="flex flex-col space-y-4 pl-2 mb-6">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setOpen(false)}
                                                className={cn(
                                                    "transition-colors hover:text-foreground text-xl font-black uppercase tracking-wide",
                                                    isActive ? "text-primary underline decoration-4 decoration-yellow-400" : "text-foreground/70"
                                                )}
                                            >
                                                {t(item.title)}
                                            </Link>
                                        );
                                    })}
                                    <Link
                                        href="/cart"
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "transition-colors hover:text-foreground text-xl font-black uppercase tracking-wide flex items-center gap-2",
                                            pathname === "/cart" ? "text-primary underline decoration-4 decoration-yellow-400" : "text-foreground/70"
                                        )}
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Cart
                                    </Link>
                                </div>

                                <div className="flex flex-col gap-6 pl-2 mt-auto pb-8">
                                    <div className="flex items-center gap-4">
                                        <ThemeToggle />
                                        <LanguageSwitcher />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Link href="/login" onClick={() => setOpen(false)}>
                                            <Button className="w-full justify-start border-2 border-black dark:border-white rounded-none font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]" variant="outline">
                                                {t('common.buttons.login')}
                                            </Button>
                                        </Link>
                                        <Link href="/register" onClick={() => setOpen(false)}>
                                            <Button className="w-full justify-start border-2 border-black dark:border-white rounded-none bg-yellow-300 text-black hover:bg-yellow-400 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                                {t('Landing.hero.getStarted')}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                )}

                {/* 2b. Mobile Header Simplified */}
                {simple && (
                    <div className="flex w-full md:hidden items-center justify-between">
                        <BrandLogo variant="flat" />
                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>
                    </div>
                )}

                {/* 3. Actions (Login/Register) */}
                <div className="hidden md:flex items-center gap-4">
                    <nav className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {!simple && (
                                <Link href="/cart">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-2 border-black dark:border-white rounded-none hover:bg-yellow-300 dark:hover:bg-yellow-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] transition-all group"
                                    >
                                        <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform text-black dark:text-white" />
                                        <span className="sr-only">Cart</span>
                                    </Button>
                                </Link>
                            )}

                            {!simple && (
                                <>
                                    <LanguageSwitcher />
                                    <ThemeToggle />
                                </>
                            )}

                            {simple && (
                                <>
                                    <LanguageSwitcher />
                                    <ThemeToggle />
                                </>
                            )}
                        </div>

                        {!simple && (
                            <>
                                <Link href="/login">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="font-bold border-2 border-black dark:border-white rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] transition-all"
                                    >
                                        {t('common.buttons.login')}
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button
                                        size="sm"
                                        className="font-bold border-2 border-black dark:border-white rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] transition-all"
                                    >
                                        {t('Landing.hero.getStarted')}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
