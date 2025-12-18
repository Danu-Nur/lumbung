import * as React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, Package2 } from "lucide-react";

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

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations();

    return (
        <div className="flex min-h-screen flex-col w-full bg-background">
            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {/* FIX: mx-auto dan justify-between agar rata tengah & ada spasi */}
                <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">

                    {/* 1. Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="flex items-center space-x-2">
                            <Package2 className="h-6 w-6" />
                            <span className="hidden font-bold sm:inline-block">
                                Lumbung
                            </span>
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                                >
                                    {t(item.title)}
                                </Link>
                            ))}

                        </nav>
                    </div>

                    {/* 2. Mobile Navigation (Hamburger) */}
                    <div className="flex md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="pr-0">
                                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                                <SheetDescription className="sr-only">Navigation</SheetDescription>
                                <Link href="/" className="flex items-center space-x-2 mb-6">
                                    <Package2 className="h-6 w-6" />
                                    <span className="font-bold">Lumbung</span>
                                </Link>
                                <div className="flex flex-col space-y-3 pl-2">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="text-foreground/70 transition-colors hover:text-foreground"
                                        >
                                            {t(item.title)}
                                        </Link>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* 3. Actions (Login/Register) */}
                    <div className="flex items-center gap-2">
                        <nav className="flex items-center gap-2">
                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* Theme Toggle */}
                            <ThemeToggle />
                            <Link href="/login">
                                <Button variant="outline" size="sm">
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

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 w-full">
                {children}
            </main>

            {/* --- FOOTER --- */}
            <footer className="border-t">
                <div className="container flex flex-col gap-4 items-center justify-between py-6 text-xs text-muted-foreground md:flex-row mx-auto">
                    <p>
                        © {new Date().getFullYear()} Lumbung.{" "}
                        {t("Footer.rights")}
                    </p>
                    <div className="flex gap-4">
                        <Link href="#features" className="hover:underline">
                            {t("Footer.links.features")}
                        </Link>
                        <Link href="#pricing" className="hover:underline">
                            {t("Footer.links.pricing")}
                        </Link>
                        <Link href="#faq" className="hover:underline">
                            {t("Footer.links.faq")}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}