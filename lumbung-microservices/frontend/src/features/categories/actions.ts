'use server';

import { cookies } from 'next/headers';
import { categoryService } from '@/lib/services/categoryService';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    // Offline/Dev fallback
    if (token === 'offline-dev-token') {
        return { user: { organizationId: 'org-offline', role: 'admin' } };
    }

    try {
        // Decode JWT payload (part 2 of the token)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return {
            user: {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                organizationId: payload.organizationId
            }
        };
    } catch (e) {
        console.error("Failed to parse token in server action:", e);
        return null;
    }
}

export async function createCategory(formData: FormData) {
    const session = await getSession();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    const data = {
        name: formData.get('name') as string,
        description: formData.get('description')?.toString() ?? undefined,
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
    const session = await getSession();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    const data = {
        name: formData.get('name') as string,
        description: formData.get('description')?.toString() ?? undefined,
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
    const session = await getSession();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    await categoryService.deleteCategory({
        id,
        organizationId: session.user.organizationId,
        softDelete: true,
    });

    revalidatePath('/inventory');
}
