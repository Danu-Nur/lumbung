import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createStockAdjustment } from '@/features/adjustments/actions';

async function getProducts(organizationId: string) {
    return await prisma.product.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { name: 'asc' },
    });
}

async function getWarehouses(organizationId: string) {
    return await prisma.warehouse.findMany({
        where: { organizationId, deletedAt: null, isActive: true },
        orderBy: { name: 'asc' },
    });
}

export default async function NewAdjustmentPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const products = await getProducts(session.user.organizationId);
    const warehouses = await getWarehouses(session.user.organizationId);

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/adjustments">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        New Stock Adjustment
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Adjust inventory quantities
                    </p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Adjustment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createStockAdjustment} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Product <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="productId"
                                    required
                                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select product</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} ({product.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Warehouse <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="warehouseId"
                                    required
                                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select warehouse</option>
                                    {warehouses.map((warehouse) => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Adjustment Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="adjustmentType"
                                    required
                                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select type</option>
                                    <option value="increase">Increase Stock</option>
                                    <option value="decrease">Decrease Stock</option>
                                </select>
                            </div>

                            <Input
                                label="Quantity"
                                name="quantity"
                                type="number"
                                min="1"
                                placeholder="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Reason <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="reason"
                                required
                                className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Select reason</option>
                                <option value="DAMAGE">Damage</option>
                                <option value="LOST">Lost</option>
                                <option value="FOUND">Found</option>
                                <option value="AUDIT">Audit Correction</option>
                                <option value="CORRECTION">Data Correction</option>
                                <option value="EXPIRED">Expired</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder="Additional notes..."
                                className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Link href="/adjustments">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit">
                                Create Adjustment
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
