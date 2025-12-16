'use client';

import { useEffect } from 'react';
import { SyncService } from '@/lib/sync';

export function SyncProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Start background sync
        console.log('Starting background sync service...');
        SyncService.startSync(30000); // Sync every 30 seconds
    }, []);

    return <>{children}</>;
}
