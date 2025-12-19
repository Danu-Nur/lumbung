'use server';

import api from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

async function getSession() {
    return await auth();
}

export async function createWarehouse(data: {
    name: string;
    code: string;
    address?: string;
    city?: string;
    phone?: string;
}) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        const response = await api.post('/warehouses', data, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/warehouses');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create warehouse');
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
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        const response = await api.patch(`/warehouses/${id}`, data, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/warehouses');
        revalidatePath(`/warehouses/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update warehouse');
    }
}

export async function deleteWarehouse(id: string) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        await api.delete(`/warehouses/${id}`, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });
        revalidatePath('/warehouses');
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to delete warehouse');
    }
}

