import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EditWarehouseForm } from './edit-warehouse-form';
import { PageHeader } from '@/components/shared/page-header';

export default async function EditWarehousePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const warehouse = await prisma.warehouse.findFirst({
        where: {
            id,
            organizationId: session.user.organizationId,
            deletedAt: null,
        },
    });

    if (!warehouse) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Warehouse"
                description={`Edit details for ${warehouse.name}`}
            />
            <EditWarehouseForm warehouse={warehouse} />
        </div>
    );
}
