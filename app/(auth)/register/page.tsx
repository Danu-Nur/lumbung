'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, AlertCircle, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function RegisterPage() {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
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
                setError(data.error || 'Registration failed');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden bg-background text-foreground transition-colors duration-300">
            {/* Ambient blobs */}
            <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
                <div className="absolute w-72 h-72 bg-primary/20 dark:bg-primary/30 top-[-3rem] left-1/4 rounded-full blur-3xl" />
                <div className="absolute w-80 h-80 bg-secondary/15 dark:bg-secondary/25 top-32 right-1/4 rounded-full blur-3xl" />
                <div className="absolute w-80 h-80 bg-pink-400/15 dark:bg-pink-600/25 bottom-[-3rem] left-1/3 rounded-full blur-3xl" />
            </div>

            {/* Gradient overlay */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none" />

            {/* Theme toggle */}
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                <Card className="glass-panel rounded-2xl border-border bg-card/75 backdrop-blur-xl shadow-lg">
                    <CardHeader className="pb-4 pt-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                                <Package className="w-7 h-7 text-primary-foreground" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-2xl">
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Inventory Pro
                            </span>
                        </CardTitle>
                        <CardDescription className="text-center mt-2">
                            Create your organization account
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-6">
                        {success ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-center text-emerald-600 dark:text-emerald-400 font-medium">
                                    Registration successful!
                                </p>
                                <p className="text-center text-sm text-muted-foreground">
                                    Redirecting to login...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-sm">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p className="font-medium">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="organizationName" className="text-sm font-medium">
                                        Organization Name
                                    </Label>
                                    <Input
                                        id="organizationName"
                                        type="text"
                                        placeholder="My Company Inc."
                                        value={formData.organizationName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, organizationName: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Your Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@mycompany.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData({ ...formData, confirmPassword: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>
                        )}

                        {!success && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link
                                        href="/login"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
