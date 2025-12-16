'use server';

import { auth } from '@/lib/auth';
import { customerService } from '@/lib/services/customerService';
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

    const customer = await customerService.createCustomer({
        organizationId: session.user.organizationId,
        ...data,
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

    const customer = await customerService.updateCustomer({
        id,
        organizationId: session.user.organizationId,
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

    await customerService.deleteCustomer({
        id,
        organizationId: session.user.organizationId,
    });

    revalidatePath('/customers');
}
