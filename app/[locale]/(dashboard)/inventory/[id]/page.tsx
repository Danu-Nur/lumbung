import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { updateProduct } from '@/features/inventory/actions';
import { DeleteProductButton } from '@/components/inventory/delete-product-button';
import { formatCurrency } from '@/lib/utils';

async function getProduct(productId: string, organizationId: string) {
    const product = await prisma.product.findFirst({
        where: {
            id: productId,
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
    });

    return product;
}

async function getCategories(organizationId: string) {
    return await prisma.category.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { name: 'asc' },
    });
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const product = await getProduct(id, session.user.organizationId);

    if (!product) {
        notFound();
    }

    const categories = await getCategories(session.user.organizationId);
    const totalStock = product.inventoryItems.reduce(
        (sum, item) => sum + item.quantityOnHand,
        0
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/inventory">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {product.name}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            SKU: {product.sku}
                        </p>
                    </div>
                </div>
                <DeleteProductButton productId={product.id} productName={product.name} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={updateProduct.bind(null, product.id)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={product.name}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            name="sku"
                                            defaultValue={product.sku}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="barcode">Barcode</Label>
                                        <Input
                                            id="barcode"
                                            name="barcode"
                                            defaultValue={product.barcode || ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Category
                                        </label>
                                        <select
                                            name="categoryId"
                                            defaultValue={product.categoryId || ''}
                                            className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        defaultValue={product.description || ''}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Unit <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="unit"
                                            defaultValue={product.unit}
                                            required
                                            className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="pcs">Pieces (pcs)</option>
                                            <option value="box">Box</option>
                                            <option value="kg">Kilogram (kg)</option>
                                            <option value="liter">Liter</option>
                                            <option value="meter">Meter</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sellingPrice">Selling Price</Label>
                                        <Input
                                            id="sellingPrice"
                                            name="sellingPrice"
                                            type="number"
                                            step="0.01"
                                            defaultValue={Number(product.sellingPrice)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="costPrice">Cost Price</Label>
                                        <Input
                                            id="costPrice"
                                            name="costPrice"
                                            type="number"
                                            step="0.01"
                                            defaultValue={Number(product.costPrice)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                                    <Input
                                        id="lowStockThreshold"
                                        name="lowStockThreshold"
                                        type="number"
                                        defaultValue={product.lowStockThreshold}
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit">
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Stock Information */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Stock</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {totalStock} {product.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Selling Price</p>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        {formatCurrency(Number(product.sellingPrice))}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Cost Price</p>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        {formatCurrency(Number(product.costPrice))}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Allocated</p>
                                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                            {product.inventoryItems.reduce((sum, item) => sum + item.allocatedQty, 0)} {product.unit}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Available</p>
                                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                            {product.inventoryItems.reduce((sum, item) => sum + item.availableQty, 0)} {product.unit}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stock by Warehouse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {product.inventoryItems.length === 0 ? (
                                <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                                    No stock in any warehouse
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {product.inventoryItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                                        >
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {item.warehouse.name}
                                            </p>
                                            <p className="font-bold text-primary-600 dark:text-primary-400">
                                                {item.quantityOnHand} {product.unit}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
