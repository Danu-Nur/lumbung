import { AmbientBackground } from '@/components/layout/ambient-background';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <AmbientBackground />
            {children}
        </div>
    );
}
