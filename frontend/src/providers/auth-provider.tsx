'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    role: string;
    organizationId: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User, redirectPath?: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check local storage or cookie
        // For now, simpler implementation
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User, redirectPath?: string) => {
        setUser(userData);
        localStorage.setItem('token', token);
        // api.defaults.headers.Authorization = `Bearer ${token}`; // If using Bearer
        router.push(redirectPath || '/dashboard');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        router.push('/login');
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
