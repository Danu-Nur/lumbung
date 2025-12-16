import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { NewSalesOrderForm } from './new-sales-order-form';

async function getFormData(organizationId: string) {
    const [customers, warehouses, products] = await Promise.all([
        prisma.customer.findMany({
            where: { organizationId, deletedAt: null },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
        prisma.warehouse.findMany({
            where: { organizationId, deletedAt: null, isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
        prisma.product.findMany({
            where: { organizationId, deletedAt: null },
            select: { id: true, name: true, sku: true, sellingPrice: true },
            orderBy: { name: 'asc' },
        }),
    ]);

    return { customers, warehouses, products };
}

export default async function NewSalesOrderPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const { customers, warehouses, products } = await getFormData(session.user.organizationId);

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center space-x-4">
                <Link href="/sales-orders">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        New Sales Order
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Create a new customer order
                    </p>
                </div>
            </div>

            <NewSalesOrderForm
                customers={customers}
                warehouses={warehouses}
                products={products.map(p => ({
                    ...p,
                    sellingPrice: Number(p.sellingPrice),
                }))}
            />
        </div>
    );
}
