import { AmbientBackground } from '@/components/layout/ambient-background';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
            <AmbientBackground className="absolute inset-0 pointer-events-none" />
            <div className="relative z-10 w-full max-w-md">
                {children}
            </div>
        </div>
    );
}