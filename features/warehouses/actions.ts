'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createWarehouse(data: {
    name: string;
    code: string;
    address?: string;
    city?: string;
    phone?: string;
}) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await prisma.warehouse.create({
        data: {
            ...data,
            organizationId: session.user.organizationId,
        },
    });

    revalidatePath('/warehouses');
    redirect('/warehouses');
}

export async function updateWarehouse(id: string, data: {
    name: string;
    code: string;
    address?: string;
    city?: string;
    phone?: string;
    isActive: boolean;
}) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await prisma.warehouse.update({
        where: { id },
        data,
    });

    revalidatePath('/warehouses');
    revalidatePath(`/warehouses/${id}`);
    redirect('/warehouses');
}

export async function deleteWarehouse(id: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    // Soft delete
    await prisma.warehouse.update({
        where: { id },
        data: { deletedAt: new Date() },
    });

    revalidatePath('/warehouses');
}
