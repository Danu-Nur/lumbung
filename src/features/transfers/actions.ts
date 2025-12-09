'use server';

import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { transferService } from '@/lib/services/transferService';
import { transferSchema } from '@/lib/validations/transfer';

export async function createTransfer(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const rawData = {
        fromWarehouseId: formData.get('fromWarehouseId') as string,
        toWarehouseId: formData.get('toWarehouseId') as string,
        notes: formData.get('notes') as string,
        items: JSON.parse(formData.get('items') as string || '[]'),
    };

    const validatedFields = transferSchema.safeParse(rawData);

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.issues[0].message);
    }

    const { fromWarehouseId, toWarehouseId, notes, items } = validatedFields.data;

    const transfer = await transferService.createTransferDraft({
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        fromWarehouseId,
        toWarehouseId,
        notes,
        items,
    });

    revalidatePath('/transfers');
    return transfer;
}

export async function sendTransfer(transferId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    await transferService.sendTransfer(transferId, session.user.id, session.user.organizationId);

    revalidatePath('/transfers');
    revalidatePath(`/transfers/${transferId}`);
}

export async function completeTransfer(transferId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    await transferService.completeTransfer(transferId, session.user.id, session.user.organizationId);

    revalidatePath('/transfers');
    revalidatePath(`/transfers/${transferId}`);
}
