import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

async function getInventory(organizationId: string) {
    const products = await prisma.product.findMany({
        where: {
            organizationId,
            deletedAt: null,
        },
        include: {
            category: true,
            inventoryItems: {
                include: {
                    warehouse: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return products;
}

export default async function InventoryPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    if (!session.user.organizationId) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">
                    Super Admin: Select an organization to view inventory
                </p>
            </div>
        );
    }

    const products = await getInventory(session.user.organizationId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Inventory
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your products and stock levels
                    </p>
                </div>
                <Link href="/inventory/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No products yet
                            </p>
                            <Link href="/inventory/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Product
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Selling Price</TableHead>
                                    <TableHead className="text-right">Total Stock</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => {
                                    const totalStock = product.inventoryItems.reduce(
                                        (sum, item) => sum + item.quantityOnHand,
                                        0
                                    );
                                    const isLowStock = totalStock <= product.lowStockThreshold;

                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {product.name}
                                                    </p>
                                                    {product.description && (
                                                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {product.sku}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {product.category?.name || '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(Number(product.sellingPrice))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={isLowStock ? 'destructive' : 'default'}>
                                                    {totalStock} {product.unit}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/inventory/${product.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}</TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
