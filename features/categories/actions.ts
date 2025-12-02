'use server';

import { auth } from '@/lib/auth';
import { categoryService } from '@/lib/services/categoryService';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

export async function createCategory(formData: FormData) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
    };

    const validated = categorySchema.parse(data);

    const category = await categoryService.createCategory({
        organizationId: session.user.organizationId,
        name: validated.name,
        description: validated.description,
    });

    revalidatePath('/categories');
    return category;
}

export async function updateCategory(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
    };

    const validated = categorySchema.parse(data);

    const category = await categoryService.updateCategory({
        id,
        organizationId: session.user.organizationId,
        name: validated.name,
        description: validated.description,
    });

    revalidatePath('/categories');
    return category;
}

export async function deleteCategory(id: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    await categoryService.deleteCategory({
        id,
        organizationId: session.user.organizationId,
        softDelete: true,
    });

    revalidatePath('/categories');
}
