'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCustomer(data: {
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

    const customer = await prisma.customer.create({
        data: {
            ...data,
            organizationId: session.user.organizationId,
        },
    });

    revalidatePath('/customers');
    return customer;
}

export async function updateCustomer(id: string, data: {
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

    const customer = await prisma.customer.update({
        where: {
            id,
            organizationId: session.user.organizationId,
        },
        data,
    });

    revalidatePath('/customers');
    return customer;
}

export async function deleteCustomer(id: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    // Soft delete
    const customer = await prisma.customer.update({
        where: {
            id,
            organizationId: session.user.organizationId,
        },
        data: {
            deletedAt: new Date(),
        },
    });

    revalidatePath('/customers');
    return customer;
}
