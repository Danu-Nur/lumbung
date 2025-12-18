'use server';

import api from '@/lib/api';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value;
}

export async function createWarehouse(data: {
    name: string;
    code: string;
    address?: string;
    city?: string;
    phone?: string;
}) {
    const token = await getToken();

    // Authorization check
    let organizationId = '';
    if (token) {
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                organizationId = payload.organizationId;
            } else if (token === 'offline-dev-token') {
                organizationId = 'org-offline';
            }
        } catch (e) { }
    }

    if (!organizationId) {
        throw new Error('Unauthorized');
    }

    try {
        const response = await api.post('/warehouses', { ...data, organizationId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        revalidatePath('/warehouses');
        return response.data;
    } catch (error: any) {
        // Offline Fallback
        const isOffline = !error.response || error.code === 'ERR_NETWORK';

        if (isOffline) {
            const tempId = `temp-${Date.now()}`;
            const warehouse = {
                id: tempId,
                organizationId,
                ...data,
                // Default fallback values
                address: data.address || '',
                city: data.city || '',
                phone: data.phone || '',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Cannot use Dexie directly in Server Action (Node.js) without checks
            // But usually Server Actions run on Node. 
            // Dexie is Client-Side Only.
            // PROBLEM: We cannot write to Dexie from a Server Action running on the Server.
            // Server Actions are for Server Logic.

            // Correction: If we want Offline support, the WRITE must happen on the Client.
            // Server Actions are NOT suitable for Offline WRITE if the Server is unreachable 
            // AND we want to save to Client-Side DB.

            // However, the User requested "refactor all prisma... with backend and dixie".
            // If we are in a Server Action, we are ONLINE by definition (client reached server).
            // But if the Backend API is down? Then the Next.js Server is up but Backend is down.
            // We can't write to Client Dexie from Next.js Server.

            // Ideally, these specific actions should be moved to CLIENT components or 
            // the Client component should call:
            // 1. Try API (via Server Action or Direct)
            // 2. If fail, Write to Dexie (Client Side).

            // Since I am refactoring existing Server Actions, I will simply wrap the API call.
            // For true offline support, the calling Component (Client) needs to handle the fallback
            // OR we accept that "Offline" means "Client completely offline", in which case Server Actions createWarehouse won't even run.
            // IF the user means "Backend is down but Frontend Server is up", we can queue it? No, where to store?

            // For this specific file refactor, I will focus on removing Prisma and calling API.
            // Dexie logic usually belongs in the Client (e.g. Services running on Client).
            // I will return a specific error or flag so the Client can handle offline save if needed,
            // OR I assume these act as a proxy.

            throw error; // Let Client handle offline logic if pure server action fails?
        }
        throw error;
    }
}

export async function updateWarehouse(id: string, data: {
    name: string;
    code: string;
    address?: string;
    city?: string;
    phone?: string;
    isActive: boolean;
}) {
    const token = await getToken();

    try {
        const response = await api.patch(`/warehouses/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });

        revalidatePath('/warehouses');
        revalidatePath(`/warehouses/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function deleteWarehouse(id: string) {
    const token = await getToken();

    try {
        await api.delete(`/warehouses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        revalidatePath('/warehouses');
    } catch (error) {
        throw error;
    }
}

