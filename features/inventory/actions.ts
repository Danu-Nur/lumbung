'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    // Check if SKU already exists
    const existing = await prisma.product.findFirst({
        where: {
            organizationId: session.user.organizationId,
            sku,
            deletedAt: null,
        },
    });

    if (existing) {
        throw new Error('SKU already exists');
    }

    // Create product
    const product = await prisma.product.create({
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
            organizationId: session.user.organizationId,
            createdById: session.user.id,
        },
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

    // Validate ownership
    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            organizationId: session.user.organizationId,
            deletedAt: null,
        },
    });

    if (!product) {
        throw new Error('Product not found');
    }

    // Update product
    await prisma.product.update({
        where: { id: productId },
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
            updatedById: session.user.id,
        },
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

    // Validate ownership
    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            organizationId: session.user.organizationId,
            deletedAt: null,
        },
    });

    if (!product) {
        throw new Error('Product not found');
    }

    // Soft delete with SKU rename to allow reuse
    await prisma.product.update({
        where: { id: productId },
        data: {
            sku: `${product.sku}_deleted_${Date.now()}`,
            deletedAt: new Date(),
            updatedById: session.user.id,
        },
    });

    revalidatePath('/inventory');
    redirect('/inventory');
}
