'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { signIn, signOut as nextAuthSignOut } from 'next-auth/react';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    role: string;
    organizationId: string;
    organizationName?: string;
    accessToken?: string;
}

interface AuthContextType {
    user: User | null;
    login: (formData: FormData) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    session
}: {
    children: React.ReactNode;
    session: Session | null;
}) {
    const [user, setUser] = useState<User | null>(() => {
        if (session?.user) {
            const token = (session.user as any).accessToken;
            if (token && typeof window !== 'undefined') {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            return {
                id: session.user.id || '',
                email: session.user.email || '',
                role: (session.user as any).roleName || '',
                organizationId: (session.user as any).organizationId || '',
                organizationName: (session.user as any).organizationName,
                accessToken: token,
            };
        }
        return null;
    });

    const [isLoading, setIsLoading] = useState(!session);
    const router = useRouter();

    useEffect(() => {
        // Handle session updates (e.g. re-focus)
        if (session?.user) {
            const token = (session.user as any).accessToken;
            // We update state if it changed, though NextJS router refresh usually re-mounts or we rely on key
            // But let's keep the sync logic here too just in case
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            setUser({
                id: session.user.id || '',
                email: session.user.email || '',
                role: (session.user as any).roleName || '',
                organizationId: (session.user as any).organizationId || '',
                organizationName: (session.user as any).organizationName,
                accessToken: token,
            });
        } else {
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        }
        setIsLoading(false);
    }, [session]);

    // Used for client-side login via NextAuth
    const login = async (formData: FormData) => {
        // We use NextAuth's signIn which hits our 'authorize' callback
        // This ensures cookies are set correctly for middleware
        const email = formData.get('email');
        const password = formData.get('password');

        // This will redirect by default, or return result if redirect: false
        // We want strict control, so we might let it redirect or handle it here.
        // But the LoginForm handles the call mostly. 
        // Actually, let's keep this simple: This context might just expose useful state,
        // while the 'action' is done in the form. 
        // But to satisfy the interface:
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        router.refresh(); // Refresh to pick up new session
    };

    const logout = async () => {
        await nextAuthSignOut({ redirect: true, callbackUrl: '/login' });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
