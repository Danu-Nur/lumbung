'use server';

import { auth } from '@/lib/auth';
import { supplierService } from '@/lib/services/supplierService';
import { revalidatePath } from 'next/cache';

export async function createSupplier(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
}) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const supplier = await supplierService.createSupplier({
        organizationId: session.user.organizationId,
        ...data,
    });

    revalidatePath('/suppliers');
    return supplier;
}

export async function updateSupplier(id: string, data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
}) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const supplier = await supplierService.updateSupplier({
        id,
        organizationId: session.user.organizationId,
        data,
    });

    revalidatePath('/suppliers');
    return supplier;
}

export async function deleteSupplier(id: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await supplierService.deleteSupplier({
        id,
        organizationId: session.user.organizationId,
    });

    revalidatePath('/suppliers');
}
