'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function RegisterForm() {
    const t = useTranslations('auth.register');
    const router = useRouter();
    const [formData, setFormData] = useState({
        organizationName: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // State untuk toggle password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Client-side Validation
        if (formData.password !== formData.confirmPassword) {
            setError(t('errors.passwordMatch'));
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError(t('errors.passwordLength'));
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error || t('errors.failed'));
            } else {
                setSuccess(true);
                // Redirect otomatis setelah 2 detik
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (err) {
            setError(t('errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    // Tampilan Sukses
    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{t('successTitle')}</h3>
                    <p className="text-muted-foreground text-sm">
                        {t('successDescription')}
                    </p>
                </div>
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mt-4" />
            </div>
        );
    }

    // Tampilan Form
    return (
        <div className="space-y-6">
            {error && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium animate-in fade-in-5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="organizationName">{t('organizationName')}</Label>
                    <Input
                        id="organizationName"
                        type="text"
                        placeholder={t('organizationPlaceholder')}
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        required
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">{t('name')}</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder={t('namePlaceholder')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">{t('password')}</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('passwordPlaceholder')}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="h-11 pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder={t('passwordPlaceholder')}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                className="h-11 pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('submitting')}
                        </>
                    ) : (
                        <>
                            {t('submit')} <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </form>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">{t('hasAccount')} </span>
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    {t('login')}
                </Link>
            </div>
        </div>
    );
}