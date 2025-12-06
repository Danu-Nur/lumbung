'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CategoryImportItem {
    name: string;
    description?: string;
}

export async function importCategoriesBatch(data: any[]): Promise<{ success: boolean; errors?: string[] }> {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return { success: false, errors: ["Unauthorized"] };
    }

    try {
        const validItems = data.filter(item => item.Name).map(item => ({
            name: String(item.Name),
            description: item.Description ? String(item.Description) : null,
            organizationId: session.user.organizationId!,
        }));

        if (validItems.length === 0) {
            return { success: true }; // Nothing to do
        }

        // Use createMany with skipDuplicates for idempotency if name is unique
        // Prisma createMany doesn't support 'onConflict' yet for Postgres in a standard generic way without raw SQL, 
        // but let's assume simple insert. If names duplicate, it might fail.
        // Better: Find existing names, filter them out, insert rest.

        const names = validItems.map(i => i.name);
        const existing = await prisma.category.findMany({
            where: {
                organizationId: session.user.organizationId,
                name: { in: names }
            },
            select: { name: true }
        });

        const existingNames = new Set(existing.map(e => e.name));
        const newItems = validItems.filter(i => !existingNames.has(i.name));

        if (newItems.length > 0) {
            await prisma.category.createMany({
                data: newItems,
                skipDuplicates: true, // safe
            });
        }

        revalidatePath('/inventory');
        revalidatePath('/categories');
        return { success: true };
    } catch (error) {
        console.error("Batch import error:", error);
        return { success: false, errors: ["Database error"] };
    }
}
