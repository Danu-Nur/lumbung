'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createPurchaseOrder } from '@/features/purchase-orders/actions';
import { SupplierCreateModal } from '@/components/domain/suppliers/supplier-create-modal';

interface LineItem {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
}

interface NewPurchaseOrderFormProps {
    suppliers: Array<{ id: string; name: string }>;
    warehouses: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string; sku: string; costPrice: number }>;
}

export function NewPurchaseOrderForm({ suppliers, warehouses, products }: NewPurchaseOrderFormProps) {
    const router = useRouter();
    const [items, setItems] = useState<LineItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [localSuppliers, setLocalSuppliers] = useState(suppliers);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);

    const handleSupplierCreated = (newSupplier: any) => {
        setLocalSuppliers([...localSuppliers, newSupplier]);
        setSelectedSupplierId(newSupplier.id);
        setIsSupplierDialogOpen(false);
    };

    const addItem = () => {
        if (!selectedProduct) return;

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        setItems([...items, {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitCost: Number(product.costPrice),
        }]);
        setSelectedProduct('');
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const total = subtotal;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append('items', JSON.stringify(items));
        if (selectedSupplierId) {
            formData.set('supplierId', selectedSupplierId);
        }

        try {
            await createPurchaseOrder(formData);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to create order');
        }
    };

    return (
        <>
            <SupplierCreateModal
                open={isSupplierDialogOpen}
                onOpenChange={setIsSupplierDialogOpen}
                onSuccess={handleSupplierCreated}
            />
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Supplier <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        name="supplierId"
                                        required
                                        value={selectedSupplierId}
                                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select supplier</option>
                                        {localSuppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsSupplierDialogOpen(true)}
                                        title="Add New Supplier"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Warehouse <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="warehouseId"
                                    required
                                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                rows={2}
                                className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Line Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="flex-1 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                            >
                                <option value="">Select product to add</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} ({product.sku})
                                    </option>
                                ))}
                            </select>
                            <Button type="button" onClick={addItem}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>

                        {items.length === 0 ? (
                            <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                                No items added yet
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.productName}</p>
                                        </div>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                            className="w-20"
                                            min="1"
                                        />
                                        <Input
                                            type="number"
                                            value={item.unitCost}
                                            onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                                            className="w-32"
                                            step="0.01"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total:</span>
                                <span>Rp {total.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-3">
                    <Link href="/purchase-orders">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={items.length === 0}>
                        Create Order
                    </Button>
                </div>
            </form>
        </>
    );
}
