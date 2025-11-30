import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Warehouse as WarehouseIcon, Package } from 'lucide-react';
import Link from 'next/link';

async function getWarehouses(organizationId: string) {
    const warehouses = await prisma.warehouse.findMany({
        where: {
            organizationId,
            deletedAt: null,
        },
        include: {
            inventoryItems: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return warehouses;
}

export default async function WarehousesPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const warehouses = await getWarehouses(session.user.organizationId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Warehouses
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage your warehouse locations
                    </p>
                </div>
                <Link href="/warehouses/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Warehouse
                    </Button>
                </Link>
            </div>

            {/* Warehouses Grid */}
            {warehouses.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <WarehouseIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            No warehouses yet
                        </p>
                        <Link href="/warehouses/new">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Warehouse
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {warehouses.map((warehouse) => {
                        const totalProducts = new Set(
                            warehouse.inventoryItems.map((item) => item.productId)
                        ).size;
                        const totalStock = warehouse.inventoryItems.reduce(
                            (sum, item) => sum + item.quantityOnHand,
                            0
                        );

                        return (
                            <Link key={warehouse.id} href={`/warehouses/${warehouse.id}`}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>{warehouse.name}</CardTitle>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    {warehouse.code}
                                                </p>
                                            </div>
                                            <div
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${warehouse.isActive
                                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                {warehouse.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {warehouse.address && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    📍 {warehouse.city || warehouse.address}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        Products
                                                    </p>
                                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                        {totalProducts}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        Total Stock
                                                    </p>
                                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                        {totalStock}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
