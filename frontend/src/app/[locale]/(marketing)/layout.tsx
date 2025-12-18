import * as React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { MarketingHeader } from "@/components/layout/marketing-header";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations();

    return (
        <div className="flex min-h-screen flex-col w-full bg-background">
            <MarketingHeader />

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