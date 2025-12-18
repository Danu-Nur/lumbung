import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Sidebar } from "./_components/sidebar";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col w-full bg-background font-sans">
            <MarketingHeader />

            <div className="container mx-auto flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10 py-10">
                <aside className="fixed top-24 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r-4 border-black dark:border-white pr-6">
                    <Sidebar />
                </aside>
                <main className="relative py-6 lg:gap-10 lg:py-8 lg:px-6">
                    <div className="mx-auto w-full min-w-0">
                        {children}
                    </div>
                </main>
            </div>

            <MarketingFooter />
        </div>
    );
}
