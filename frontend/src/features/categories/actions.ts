'use server';

import api from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

async function getSession() {
    return await auth();
}

export async function createCategory(formData: FormData) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    const data = {
        name: formData.get('name') as string,
        description: formData.get('description')?.toString() ?? undefined,
    };

    const validated = categorySchema.parse(data);

    try {
        const response = await api.post('/categories', validated, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/categories');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create category');
    }
}

export async function updateCategory(id: string, formData: FormData) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    const data = {
        name: formData.get('name') as string,
        description: formData.get('description')?.toString() ?? undefined,
    };

    const validated = categorySchema.parse(data);

    try {
        const response = await api.put(`/categories/${id}`, validated, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/categories');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update category');
    }
}

export async function deleteCategory(id: string) {
    const session = await getSession();
    if (!(session as any)?.accessToken) throw new Error('Unauthorized');

    try {
        await api.delete(`/categories/${id}`, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });

        revalidatePath('/categories');
        revalidatePath('/inventory');
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to delete category');
    }
}
