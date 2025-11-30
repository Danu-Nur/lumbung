import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
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
                    <h1 className="text-3xl font-bold text-foreground">
                        Warehouses
                    </h1>
                    <p className="text-muted-foreground mt-1">
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
                        <WarehouseIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
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
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {warehouse.code}
                                                </p>
                                            </div>
                                            <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>
                                                {warehouse.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {warehouse.address && (
                                                <p className="text-sm text-muted-foreground">
                                                    📍 {warehouse.city || warehouse.address}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Products
                                                    </p>
                                                    <p className="text-lg font-bold text-foreground">
                                                        {totalProducts}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Total Stock
                                                    </p>
                                                    <p className="text-lg font-bold text-foreground">
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
