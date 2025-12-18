import { MarketingHeader } from '@/components/layout/marketing-header';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            {/* Header (Simplified) */}
            <MarketingHeader simple={true} />

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center justify-center p-4">
                <main className="w-full flex justify-center">
                    {children}
                </main>
            </div>
        </div>
    );
}