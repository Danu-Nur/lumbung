'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    // Check uniqueness
    const existing = await prisma.category.findFirst({
        where: {
            organizationId: session.user.organizationId,
            name: validated.name,
            deletedAt: null,
        },
    });

    if (existing) {
        throw new Error('Category with this name already exists');
    }

    const category = await prisma.category.create({
        data: {
            ...validated,
            organizationId: session.user.organizationId,
        },
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

    // Check uniqueness (excluding self)
    const existing = await prisma.category.findFirst({
        where: {
            organizationId: session.user.organizationId,
            name: validated.name,
            deletedAt: null,
            NOT: { id },
        },
    });

    if (existing) {
        throw new Error('Category with this name already exists');
    }

    const category = await prisma.category.update({
        where: { id },
        data: validated,
    });

    revalidatePath('/categories');
    return category;
}

export async function deleteCategory(id: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    // Check for attached products
    const productsCount = await prisma.product.count({
        where: {
            categoryId: id,
            deletedAt: null,
        },
    });

    if (productsCount > 0) {
        throw new Error(`Cannot delete category. It has ${productsCount} active products.`);
    }

    await prisma.category.update({
        where: { id },
        data: { deletedAt: new Date() },
    });

    revalidatePath('/categories');
}
