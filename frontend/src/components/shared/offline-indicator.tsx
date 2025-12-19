'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        setIsOffline(!navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm uppercase tracking-wider">
                <WifiOff className="w-4 h-4" />
                Offline Mode: Menggunakan Data Lokal
            </div>
        </div>
    );
}
