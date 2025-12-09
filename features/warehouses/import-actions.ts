'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function importWarehouseBatch(batch: any[]) {
    try {
        const session = await auth();
        if (!session?.user?.id || !session.user.organizationId) {
            return { success: false, errors: ['Unauthorized'] };
        }

        const organizationId = session.user.organizationId;
        const errors: string[] = [];
        let successCount = 0;

        for (const [index, item] of batch.entries()) {
            const rowNum = index + 2; // Excel row number (1-based + header)

            // Normalize keys
            const normalizedItem: any = {};
            Object.keys(item).forEach(key => {
                normalizedItem[key.trim().toLowerCase()] = item[key];
            });

            // Extract fields
            const name = normalizedItem['name'] || normalizedItem['nama'];
            const code = normalizedItem['code'] || normalizedItem['kode'];
            const location = normalizedItem['location'] || normalizedItem['lokasi'] || normalizedItem['address'] || normalizedItem['alamat'];
            const description = normalizedItem['description'] || normalizedItem['deskripsi'];

            if (!name || !code) {
                errors.push(`Row ${rowNum}: Name and Code are required.`);
                continue;
            }

            try {
                // Upsert Warehouse by Code
                await prisma.warehouse.upsert({
                    where: {
                        organizationId_code: {
                            organizationId,
                            code: String(code).trim()
                        }
                    },
                    create: {
                        organizationId,
                        name: String(name).trim(),
                        code: String(code).trim(),
                        address: location ? String(location).trim() : undefined,
                        description: description ? String(description).trim() : undefined,
                        isActive: true
                    },
                    update: {
                        name: String(name).trim(),
                        address: location ? String(location).trim() : undefined,
                        description: description ? String(description).trim() : undefined
                    }
                });
                successCount++;
            } catch (err: any) {
                console.error(`Error importing row ${rowNum}:`, err);
                errors.push(`Row ${rowNum}: ${err.message}`);
            }
        }

        revalidatePath('/inventory');
        revalidatePath('/warehouses'); // Redirected but good to keep clean

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };

    } catch (error: any) {
        console.error('Batch import failed:', error);
        return { success: false, errors: [error.message] };
    }
}
