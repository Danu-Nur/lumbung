import { Package } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LoginForm } from './login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - Inventory Pro',
    description: 'Login to your account',
};

export default function LoginPage() {
    return (
        <>
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className="w-full space-y-8">
                <div className="text-center space-y-6">
                    <div className="flex justify-center items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                            <Package className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold">Inventory Pro</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>
                </div>

                <LoginForm />
            </div>
        </>
    );
}