'use server';

import api from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

async function getSession() {
    return await auth();
}

export async function createTransfer(formData: FormData) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    const rawData = {
        fromWarehouseId: formData.get('fromWarehouseId') as string,
        toWarehouseId: formData.get('toWarehouseId') as string,
        notes: formData.get('notes') as string,
        items: JSON.parse(formData.get('items') as string || '[]'),
    };

    try {
        const response = await api.post('/inventory/transfers', rawData, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/transfers');
        revalidatePath('/inventory');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create transfer');
    }
}

export async function sendTransfer(transferId: string) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        // await api.post(`/inventory/transfers/${transferId}/send`, {}, { ... });
        revalidatePath('/transfers');
    } catch (error) {
        throw error;
    }
}

export async function completeTransfer(transferId: string) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        // await api.post(`/inventory/transfers/${transferId}/complete`, {}, { ... });
        revalidatePath('/transfers');
    } catch (error) {
        throw error;
    }
}
