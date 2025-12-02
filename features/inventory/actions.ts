'use server';

import { auth } from '@/lib/auth';
import { productService } from '@/lib/services/productService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const barcode = formData.get('barcode') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const unit = formData.get('unit') as string;
    const sellingPrice = parseFloat(formData.get('sellingPrice') as string);
    const costPrice = parseFloat(formData.get('costPrice') as string);
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string);

    // Validate
    if (!name || !sku || !unit || isNaN(sellingPrice) || isNaN(costPrice)) {
        throw new Error('Missing required fields');
    }

    await productService.createProduct({
        organizationId: session.user.organizationId,
        name,
        sku,
        barcode: barcode || null,
        description: description || null,
        categoryId: categoryId || null,
        unit,
        sellingPrice,
        costPrice,
        lowStockThreshold: lowStockThreshold || 10,
        createdById: session.user.id,
    });

    revalidatePath('/inventory');
    redirect('/inventory');
}

export async function updateProduct(productId: string, formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const barcode = formData.get('barcode') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const unit = formData.get('unit') as string;
    const sellingPrice = parseFloat(formData.get('sellingPrice') as string);
    const costPrice = parseFloat(formData.get('costPrice') as string);
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string);

    await productService.updateProduct({
        id: productId,
        organizationId: session.user.organizationId,
        data: {
            name,
            sku,
            barcode: barcode || null,
            description: description || null,
            categoryId: categoryId || null,
            unit,
            sellingPrice,
            costPrice,
            lowStockThreshold: lowStockThreshold || 10,
        },
        updatedById: session.user.id,
    });

    revalidatePath('/inventory');
    revalidatePath(`/inventory/${productId}`);
    redirect('/inventory');
}

export async function deleteProduct(productId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await productService.deleteProduct({
        id: productId,
        organizationId: session.user.organizationId,
        updatedById: session.user.id,
    });

    revalidatePath('/inventory');
    redirect('/inventory');
}
