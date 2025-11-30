'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Package,
    AlertCircle,
    Eye,
    EyeOff,
    Copy,
    Check,
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // UX State
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

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
                setError('Invalid email or password');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);

        // Auto fill the form for convenience
        if (field.includes('@')) setEmail(text);
        else setPassword(text);

        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden bg-background text-foreground transition-colors duration-300">
            {/* Ambient blobs */}
            <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
                <div className="absolute w-72 h-72 bg-primary/20 dark:bg-primary/30 top-[-3rem] left-1/4 rounded-full blur-3xl" />
                <div
                    className="absolute w-80 h-80 bg-secondary/15 dark:bg-secondary/25 top-32 right-1/4 rounded-full blur-3xl"
                />
                <div
                    className="absolute w-80 h-80 bg-pink-400/15 dark:bg-pink-600/25 bottom-[-3rem] left-1/3 rounded-full blur-3xl"
                />
            </div>

            {/* Gradient overlay */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none" />

            {/* Theme toggle */}
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            {/* Wrapper */}
            <div className="relative z-10 w-full max-w-4xl grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
                {/* Left: copy & highlight */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                            <Package className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground uppercase tracking-[0.18em]">
                                Inventory Pro
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Smart Warehouse & Stock Control
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                            Login ke{' '}
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                dashboard inventory
                            </span>{' '}
                            Anda.
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground max-w-lg">
                            Pantau stok, mutasi barang, dan performa gudang dalam satu panel. No
                            more Excel frankenstein dan catatan manual di kertas.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                        <div className="glass-panel p-4 flex flex-col gap-1">
                            <p className="text-xs font-semibold text-foreground">
                                +35% lebih cepat
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Picking & packing berkat real-time stock visibility.
                            </p>
                        </div>
                        <div className="glass-panel p-4 flex flex-col gap-1">
                            <p className="text-xs font-semibold text-foreground">
                                Minim selisih stok
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Log aktivitas & kontrol akses bikin audit lebih tenang.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: login card */}
                <Card className="glass-panel w-full rounded-2xl border-border bg-card/75 backdrop-blur-xl shadow-lg">
                    <CardHeader className="pb-3 pt-6">
                        <div className="space-y-1 text-center">
                            <CardTitle className="text-xl font-semibold tracking-tight">
                                Welcome back
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Masuk untuk mengakses Inventory Pro dashboard.
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-2 pb-6">
                        {error && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    className="h-10 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-medium">
                                        Password
                                    </Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-[11px] text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                        className="h-10 pr-10 text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 text-sm rounded-xl font-semibold shadow-md"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Sign In</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Demo credentials section */}
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xs font-semibold text-foreground uppercase tracking-[0.16em]">
                                        Demo Access
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Klik kartu di bawah untuk auto-copy & auto-fill.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-2 text-xs">
                                {/* Demo email */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        copyToClipboard('admin@demowarehouse.com', 'email1')
                                    }
                                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/50 border border-border hover:border-primary/60 transition-colors text-left"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">
                                            Admin
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            admin@demowarehouse.com
                                        </span>
                                    </div>
                                    {copiedField === 'email1' ? (
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </button>

                                {/* Demo password */}
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard('admin123', 'pass1')}
                                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/50 border border-border hover:border-primary/60 transition-colors text-left"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">
                                            Password
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            •••••••• (admin123)
                                        </span>
                                    </div>
                                    {copiedField === 'pass1' ? (
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-1 text-center text-xs text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/register"
                                className="font-semibold text-primary hover:underline"
                            >
                                Register here
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
