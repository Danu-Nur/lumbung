'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    const supplier = await prisma.supplier.create({
        data: {
            ...data,
            organizationId: session.user.organizationId,
        },
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

    const supplier = await prisma.supplier.update({
        where: { id },
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

    // Check for related records (Purchase Orders)
    const poCount = await prisma.purchaseOrder.count({
        where: { supplierId: id },
    });

    if (poCount > 0) {
        throw new Error(`Cannot delete supplier. They have ${poCount} purchase orders.`);
    }

    await prisma.supplier.update({
        where: { id },
        data: { deletedAt: new Date() },
    });

    revalidatePath('/suppliers');
}
