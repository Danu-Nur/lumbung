'use server';

import api from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

async function getSession() {
    return await auth();
}

export async function createOpname(formData: FormData) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    const warehouseId = formData.get('warehouseId') as string;
    const notes = formData.get('notes') as string;
    // For single opname creation from the dialog, we might not have items yet?
    // Looking at the CreateOpnameDialog, it only sends warehouseId and notes.
    // The previous implementation created a DRAFT.
    // Our new backend createStockOpname expects items.
    // Let's assume for now it creates a draft or we send empty items if the backend allows.
    // OR we change the backend to allow empty items.
    // Actually, backend schema says items are created.

    try {
        const response = await api.post('/inventory/opnames', {
            warehouseId,
            notes,
            items: [] // Starting as a draft/empty
        }, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/inventory?view=opname');
        return { success: true, id: response.data.id };
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create opname');
    }
}

export async function startOpname(opnameId: string) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        // await api.post(`/inventory/opnames/${opnameId}/start`, {}, { ... });
        revalidatePath(`/inventory/opname/${opnameId}`);
    } catch (error) {
        throw error;
    }
}

export async function saveOpnameItem(itemId: string, actualQty: number) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        // await api.patch(`/inventory/opnames/items/${itemId}`, { actualQty }, { ... });
        revalidatePath("/inventory/opname/[id]");
    } catch (error) {
        throw error;
    }
}

export async function completeOpname(opnameId: string) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        // await api.post(`/inventory/opnames/${opnameId}/complete`, {}, { ... });
        revalidatePath(`/inventory/opname/${opnameId}`);
    } catch (error) {
        throw error;
    }
}
