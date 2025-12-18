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
        <header className="sticky top-0 z-50 w-full border-b-4 border-black dark:border-white bg-white dark:bg-black">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">

                {/* 1. Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_#ffffff] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                        <Package2 className="h-6 w-6 text-black" />
                        <span className="font-black text-lg hidden sm:inline-block uppercase tracking-tight text-black">
                            Lumbung
                        </span>
                    </Link>
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
                </div>

                {/* 2. Mobile Navigation (Hamburger) */}
                <div className="flex md:hidden items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-yellow-300 dark:bg-yellow-500 border-2 border-black dark:border-white p-1">
                            <Package2 className="h-6 w-6 text-black" />
                        </div>
                        <span className="font-black text-lg uppercase tracking-tight">
                            Lumbung
                        </span>
                    </Link>

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
                            <Link href="/" className="flex items-center space-x-2 mb-8 bg-yellow-300 dark:bg-yellow-500 border-2 border-black dark:border-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] w-fit" onClick={() => setOpen(false)}>
                                <Package2 className="h-6 w-6 text-black" />
                                <span className="font-black text-black uppercase">Lumbung</span>
                            </Link>
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

                {/* 3. Actions (Login/Register) */}
                <div className="hidden md:flex items-center gap-4">
                    <nav className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>

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

                    </nav>
                </div>
            </div>
        </header>
    );
}
