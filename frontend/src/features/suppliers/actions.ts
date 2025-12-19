'use server';

import api from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

async function getSession() {
    return await auth();
}

export async function createSupplier(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
}) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        const response = await api.post('/suppliers', data, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/inventory');
        revalidatePath('/suppliers');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create supplier');
    }
}

export async function updateSupplier(id: string, data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
}) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        const response = await api.put(`/suppliers/${id}`, data, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/inventory');
        revalidatePath('/suppliers');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update supplier');
    }
}

export async function deleteSupplier(id: string) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        await api.delete(`/suppliers/${id}`, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/inventory');
        revalidatePath('/suppliers');
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to delete supplier');
    }
}
