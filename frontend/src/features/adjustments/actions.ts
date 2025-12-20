'use server';

import api from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
    return await auth();
}

export async function createStockAdjustment(formData: FormData) {
    const session = await getSession();
    if (!(session?.user as any)?.accessToken) throw new Error('Unauthorized');

    const productId = formData.get('productId') as string;
    const warehouseId = formData.get('warehouseId') as string;
    const adjustmentType = formData.get('adjustmentType') as 'increase' | 'decrease';
    const quantity = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as string;
    const notes = formData.get('notes') as string;

    if (!productId || !warehouseId || !adjustmentType || !quantity || !reason) {
        throw new Error('Missing required fields');
    }

    try {
        const response = await api.post('/inventory/adjustment', {
            productId,
            warehouseId,
            type: adjustmentType, // Backend expects 'type'
            quantity,
            reason,
            notes
        }, {
            headers: { Authorization: `Bearer ${(session?.user as any).accessToken}` }
        });

        revalidatePath('/adjustments');
        revalidatePath('/inventory');
        return response.data;
    } catch (error: any) {
        let message = error.response?.data?.error || error.message || 'Failed to create adjustment';
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        }
        throw new Error(message);
    }
}

export async function reverseStockAdjustment(adjustmentId: string) {
    const session = await getSession();
    if (!(session?.user as any)?.accessToken) throw new Error('Unauthorized');

    // For now, if backend doesn't have reversal, we might need to add it or skip
    // Let's assume we want to keep it simple and just revalidate if we implement it later
    try {
        // Placeholder for reversal API
        // await api.post(`/inventory/adjustment/${adjustmentId}/reverse`, {}, { ... });
        revalidatePath('/adjustments');
    } catch (error) {
        throw error;
    }
}

export async function getStockHistory(productId: string) {
    const session = await getSession();
    if (!(session?.user as any)?.accessToken) throw new Error('Unauthorized');

    try {
        const movements = await prisma.inventoryMovement.findMany({
            where: {
                productId,
                product: {
                    organizationId: (session!.user as any).organizationId
                }
            },
            include: {
                warehouse: true,
                product: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        return movements || [];
    } catch (error) {
        console.error("Error fetching stock history:", error);
        return [];
    }
}
