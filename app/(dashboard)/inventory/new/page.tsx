import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createProduct } from '@/features/inventory/actions';

async function getCategories(organizationId: string) {
    return await prisma.category.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { name: 'asc' },
    });
}

export default async function NewProductPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const categories = await getCategories(session.user.organizationId);

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/inventory">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Add New Product
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Create a new product in your inventory
                    </p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createProduct} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Product Name"
                                name="name"
                                placeholder="e.g., Laptop Dell XPS 13"
                                required
                            />
                            <Input
                                label="SKU"
                                name="sku"
                                placeholder="e.g., ELEC-LAP-001"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Barcode"
                                name="barcode"
                                placeholder="e.g., 1234567890123"
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Category
                                </label>
                                <select
                                    name="categoryId"
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

                        <Input
                            label="Description"
                            name="description"
                            placeholder="Product description"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Unit <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="unit"
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
                            <Input
                                label="Selling Price"
                                name="sellingPrice"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                            />
                            <Input
                                label="Cost Price"
                                name="costPrice"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <Input
                            label="Low Stock Threshold"
                            name="lowStockThreshold"
                            type="number"
                            placeholder="10"
                            defaultValue="10"
                        />

                        <div className="flex justify-end space-x-3 pt-4">
                            <Link href="/inventory">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit">
                                Create Product
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
