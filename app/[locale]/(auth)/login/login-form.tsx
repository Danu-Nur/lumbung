'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertCircle,
    Eye,
    EyeOff,
    Copy,
    Check,
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        if (field === 'email') setEmail(text);
        if (field === 'password') setPassword(text);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <CardDescription>
                    Login to your warehouse dashboard
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-primary hover:underline"
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
                                required
                                className="pr-11"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading} size="lg">
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="pt-6 border-t space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            Demo Credentials
                        </span>
                    </div>

                    <div className="grid gap-3">
                        {/* Motor Admin */}
                        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-semibold">Motor Admin</p>
                            <button type="button" onClick={() => copyToClipboard('admin@majumotor.com', 'motor-email')}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left">
                                <div>
                                    <div className="font-medium">Email</div>
                                    <div className="text-sm text-muted-foreground">admin@majumotor.com</div>
                                </div>
                                {copiedField === 'motor-email' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                            <button type="button" onClick={() => copyToClipboard('admin123', 'motor-pass')}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left">
                                <div>
                                    <div className="font-medium">Password</div>
                                    <div className="text-sm text-muted-foreground">admin123</div>
                                </div>
                                {copiedField === 'motor-pass' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Mobil Admin */}
                        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-semibold">Mobil Admin</p>
                            <button type="button" onClick={() => copyToClipboard('admin@otojaya.com', 'mobil-email')}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left">
                                <div>
                                    <div className="font-medium">Email</div>
                                    <div className="text-sm text-muted-foreground">admin@otojaya.com</div>
                                </div>
                                {copiedField === 'mobil-email' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                            <button type="button" onClick={() => copyToClipboard('admin123', 'mobil-pass')}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left">
                                <div>
                                    <div className="font-medium">Password</div>
                                    <div className="text-sm text-muted-foreground">admin123</div>
                                </div>
                                {copiedField === 'mobil-pass' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Original Demo (opsional dipertahankan) */}
                        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-semibold">Warehouse Demo</p>
                            <button type="button" onClick={() => copyToClipboard('admin@demowarehouse.com', 'email')}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left">
                                <div>
                                    <div className="font-medium">Email</div>
                                    <div className="text-sm text-muted-foreground">admin@demowarehouse.com</div>
                                </div>
                                {copiedField === 'email' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                            <button type="button" onClick={() => copyToClipboard('admin123', 'password')}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left">
                                <div>
                                    <div className="font-medium">Password</div>
                                    <div className="text-sm text-muted-foreground">admin123</div>
                                </div>
                                {copiedField === 'password' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-center py-6 border-t">
                <p className="text-sm text-muted-foreground text-center">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-medium text-primary hover:underline">
                        Register here
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
