import { Package } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { RegisterForm } from './register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register - Inventory Pro',
    description: 'Create a new account',
};

export default function RegisterPage() {
    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Theme toggle */}
            <div className="absolute -top-16 right-0">
                <ThemeToggle />
            </div>

            <div className="flex flex-col items-center space-y-6 mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                        <Package className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold">Inventory Pro</span>
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your details to create your organization
                    </p>
                </div>
            </div>

            <RegisterForm />
        </div>
    );
}
