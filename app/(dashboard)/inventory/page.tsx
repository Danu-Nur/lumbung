import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
                <p className="text-slate-600 dark:text-slate-400">
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Inventory
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
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
                            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
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
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Product
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            SKU
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Category
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Selling Price
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Total Stock
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => {
                                        const totalStock = product.inventoryItems.reduce(
                                            (sum, item) => sum + item.quantityOnHand,
                                            0
                                        );
                                        const isLowStock = totalStock <= product.lowStockThreshold;

                                        return (
                                            <tr
                                                key={product.id}
                                                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                                            {product.name}
                                                        </p>
                                                        {product.description && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
                                                                {product.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {product.sku}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {product.category?.name || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(Number(product.sellingPrice))}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isLowStock
                                                                ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                                                                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                            }`}
                                                    >
                                                        {totalStock} {product.unit}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Link href={`/inventory/${product.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
