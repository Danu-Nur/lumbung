import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { AmbientBackground } from '@/components/layout/ambient-background';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            <AmbientBackground />
            <Sidebar />
            <div className="ml-64">
                <Topbar />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
