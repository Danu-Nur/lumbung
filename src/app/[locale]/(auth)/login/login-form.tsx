'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Data akun demo kita simpan di array agar kodenya bersih (tidak berulang-ulang)
const DEMO_ACCOUNTS = [
    { label: 'Motor Admin', email: 'admin@majumotor.com', pass: 'admin123' },
    { label: 'Mobil Admin', email: 'admin@otojaya.com', pass: 'admin123' },
    { label: 'Warehouse', email: 'admin@demowarehouse.com', pass: 'admin123' },
];

export function LoginForm() {
    const t = useTranslations('auth.login');
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(t('errors.invalidCredentials'));
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError(t('errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    // Fitur baru: Klik langsung isi form
    const handleAutoFill = (demoEmail: string, demoPass: string) => {
        setEmail(demoEmail);
        setPassword(demoPass);
    };

    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/15 text-destructive text-sm font-medium animate-in fade-in-5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11" // Sedikit lebih tinggi agar enak dipandang
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">{t('password')}</Label>
                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('passwordPlaceholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 pr-11"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-9 w-9 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            {t('submitting')}
                        </>
                    ) : (
                        <>
                            {t('submit')} <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </form>

            {/* Bagian Footer: Register Link */}
            <div className="text-center text-sm">
                <span className="text-muted-foreground">{t('noAccount')} </span>
                <Link href="/register" className="font-semibold text-primary hover:underline">
                    {t('register')}
                </Link>
            </div>

            {/* Bagian Demo Credentials (Dirapikan) */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> {t('demoAccounts')}
                    </span>
                </div>
            </div>

            <div className="grid gap-2">
                {DEMO_ACCOUNTS.map((acc, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => handleAutoFill(acc.email, acc.pass)}
                        className="flex items-center justify-between w-full p-3 text-sm text-left border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="grid gap-0.5">
                                <span className="font-medium">{acc.label}</span>
                                <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/80">
                                    {acc.email}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded group-hover:bg-background/20">
                            {t('autoFill')}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}