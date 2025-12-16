import { AmbientBackground } from '@/components/layout/ambient-background';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-muted/30 overflow-hidden p-4">
            {/* Background Effect */}
            {/* <AmbientBackground className="absolute inset-0 pointer-events-none" /> */}

            {/* Global Utility Buttons (Pojok Kanan Atas) */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 z-50">
                <LanguageSwitcher />
                <ThemeToggle />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 w-full flex justify-center">
                {children}
            </div>
        </div>
    );
}