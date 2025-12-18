import * as React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col w-full bg-background">
            <MarketingHeader />

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 w-full">
                {children}
            </main>

            {/* --- FOOTER --- */}
            <MarketingFooter />
        </div>
    );
}