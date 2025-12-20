'use server';

import { auth } from '@/lib/auth';
import { productService } from '@/lib/services/productService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import api from '@/lib/api';

export async function createProduct(formData: FormData) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;

    if (!token || !session?.user || !session.user.organizationId) {
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
    const initialStock = parseFloat(formData.get('initialStock') as string) || 0;
    const warehouseId = formData.get('warehouseId') as string;
    const supplierId = formData.get('supplierId') as string;

    // Validate
    if (!name || !sku || !unit || isNaN(sellingPrice) || isNaN(costPrice)) {
        throw new Error('Missing required fields');
    }

    try {
        await productService.createProduct({
            organizationId: session.user.organizationId!,
            name,
            sku,
            barcode: barcode || null,
            description: description || null,
            categoryId: categoryId || null,
            supplierId: supplierId || null,
            unit,
            sellingPrice,
            costPrice,
            lowStockThreshold: lowStockThreshold || 10,
            initialStock,
            warehouseId: warehouseId || undefined,
            createdById: session.user.id,
            token,
        });

        revalidatePath('/inventory');
    } catch (error: any) {
        let message = error.response?.data?.error || error.message || 'Failed to create product';
        if (typeof message !== 'string') message = JSON.stringify(message);
        throw new Error(message);
    }
}

export async function updateProduct(productId: string, formData: FormData) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;

    if (!token || !session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const barcode = formData.get('barcode') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const supplierId = formData.get('supplierId') as string;
    const unit = formData.get('unit') as string;
    const sellingPrice = parseFloat(formData.get('sellingPrice') as string);
    const costPrice = parseFloat(formData.get('costPrice') as string);
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string);

    try {
        await productService.updateProduct({
            id: productId,
            organizationId: session.user.organizationId,
            data: {
                name,
                sku,
                barcode: barcode || null,
                description: description || null,
                categoryId: categoryId || null,
                supplierId: supplierId || null,
                unit,
                sellingPrice,
                costPrice,
                lowStockThreshold: lowStockThreshold || 10,
            },
            updatedById: session.user.id,
            token,
        });

        revalidatePath('/inventory');
    } catch (error: any) {
        let message = error.response?.data?.error || error.message || 'Failed to update product';
        if (typeof message !== 'string') message = JSON.stringify(message);
        throw new Error(message);
    }
}

export async function deleteProduct(productId: string) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;

    if (!token || !session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    try {
        await productService.deleteProduct({
            id: productId,
            organizationId: session.user.organizationId,
            updatedById: session.user.id,
            token,
        });

        revalidatePath('/inventory');
    } catch (error: any) {
        let message = error.response?.data?.error || error.message || 'Failed to delete product';
        if (typeof message !== 'string') message = JSON.stringify(message);
        throw new Error(message);
    }
}

export async function getProductHistory(productId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const [priceHistory, movements] = await Promise.all([
        prisma.productPriceHistory.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { createdBy: true }
        }),
        prisma.inventoryMovement.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                warehouse: true,
            }
        })
    ]);

    return { priceHistory, movements };
}

export async function createStockAdjustment(data: {
    productId: string;
    warehouseId: string;
    type: 'increase' | 'decrease';
    quantity: number;
    reason: string;
    notes?: string;
}) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;

    if (!token || !session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const { productId, warehouseId, type, quantity, reason, notes } = data;

    try {
        // Call Backend API
        await api.post('/inventory/adjustment', {
            productId,
            warehouseId,
            type, // Backend expects 'type'
            quantity,
            reason,
            notes
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        revalidatePath('/inventory');
    } catch (error: any) {
        let message = error.response?.data?.error || error.message || 'Failed to create adjustment';
        if (typeof message !== 'string') message = JSON.stringify(message);
        throw new Error(message);
    }
}

export async function createStockAdjustmentFromForm(formData: FormData) {
    const productId = formData.get('productId') as string;
    const warehouseId = formData.get('warehouseId') as string;
    const type = formData.get('adjustmentType') as 'increase' | 'decrease';
    const quantity = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as string;
    const notes = formData.get('notes') as string;

    if (!productId || !warehouseId || !type || !quantity || !reason) {
        throw new Error('Missing required fields');
    }

    await createStockAdjustment({
        productId,
        warehouseId,
        type,
        quantity,
        reason,
        notes,
    });

    redirect('/adjustments');
}
