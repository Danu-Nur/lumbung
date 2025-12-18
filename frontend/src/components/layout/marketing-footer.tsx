"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function MarketingFooter() {
    const t = useTranslations("Footer");
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    const footerLinks = [
        { label: "links.features", href: "/#features", hash: "#features" },
        { label: "links.pricing", href: "/#pricing", hash: "#pricing" },
        { label: "links.faq", href: "/#faq", hash: "#faq" },
    ];

    return (
        <footer className="border-t-4 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900">
            <div className="container flex flex-col gap-6 items-center justify-between py-10 text-sm font-bold uppercase tracking-wide text-black dark:text-neutral-400 md:flex-row mx-auto">
                <p>
                    © {new Date().getFullYear()} Lumbung.{" "}
                    {t("rights")}
                </p>
                <div className="flex gap-6">
                    {footerLinks.map((link) => {
                        // Logic: If we are on the homepage, use a simple <a> tag with hash for smooth scrolling.
                        // Otherwise, use the Next.js Link component to navigate to the homepage + hash.
                        // We also need to check if we are on the locale root e.g. /en or /id, but usePathname from navigation usually returns path relative to locale or fully resolved.
                        // with next-intl `usePathname`, it returns the path *without* the locale prefix usually.

                        return isHomePage ? (
                            <a
                                key={link.hash}
                                href={link.hash}
                                className="hover:underline decoration-2 underline-offset-4 decoration-black dark:decoration-white hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                            >
                                {t(link.label)}
                            </a>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hover:underline decoration-2 underline-offset-4 decoration-black dark:decoration-white hover:text-black dark:hover:text-white transition-colors"
                            >
                                {t(link.label)}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </footer>
    );
}
