import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NewWarehouseForm } from './new-warehouse-form';
import { PageHeader } from '@/components/shared/page-header';

export default async function NewWarehousePage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add Warehouse"
                description="Create a new warehouse location"
            />
            <NewWarehouseForm />
        </div>
    );
}
