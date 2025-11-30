import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { fulfillSalesOrder, updateOrderStatus } from '@/features/sales-orders/actions';

async function getSalesOrder(orderId: string, organizationId: string) {
    return await prisma.salesOrder.findFirst({
        where: {
            id: orderId,
            organizationId,
        },
        include: {
            customer: true,
            warehouse: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
}

export default async function SalesOrderDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const order = await getSalesOrder(params.id, session.user.organizationId);

    if (!order) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/sales-orders">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {order.orderNumber}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {formatDate(order.orderDate)}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/sales-orders/${order.id}/invoice`}>
                        <Button variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            View Invoice
                        </Button>
                    </Link>
                    {order.status === 'DRAFT' && (
                        <form action={updateOrderStatus.bind(null, order.id, 'CONFIRMED')}>
                            <Button type="submit">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Confirm Order
                            </Button>
                        </form>
                    )}
                    {order.status === 'CONFIRMED' && (
                        <form action={fulfillSalesOrder.bind(null, order.id)}>
                            <Button type="submit">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Fulfill Order
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Product
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Qty
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Price
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-slate-100 dark:border-slate-800"
                                            >
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                                        {item.product.name}
                                                    </p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {item.product.sku}
                                                    </p>
                                                </td>
                                                <td className="text-right py-3 px-4 text-slate-900 dark:text-slate-100">
                                                    {item.quantity}
                                                </td>
                                                <td className="text-right py-3 px-4 text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(Number(item.unitPrice))}
                                                </td>
                                                <td className="text-right py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(Number(item.lineTotal))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                            {formatCurrency(Number(order.subtotal))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Discount:</span>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                            {formatCurrency(Number(order.discount))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span className="text-slate-900 dark:text-slate-100">Total:</span>
                                        <span className="text-slate-900 dark:text-slate-100">
                                            {formatCurrency(Number(order.total))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Info Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.status === 'DRAFT'
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                                        : order.status === 'CONFIRMED'
                                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : order.status === 'FULFILLED'
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                    }`}
                            >
                                {order.status}
                            </span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                    {order.customer.name}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {order.customer.email}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {order.customer.phone}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Warehouse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {order.warehouse.name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {order.warehouse.code}
                            </p>
                        </CardContent>
                    </Card>

                    {order.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {order.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
