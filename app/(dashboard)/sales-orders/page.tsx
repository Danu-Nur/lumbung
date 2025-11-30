import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

async function getSalesOrders(organizationId: string) {
    return await prisma.salesOrder.findMany({
        where: { organizationId },
        include: {
            customer: true,
            warehouse: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
}

export default async function SalesOrdersPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const orders = await getSalesOrders(session.user.organizationId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Sales Orders
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage customer orders
                    </p>
                </div>
                <Link href="/sales-orders/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Order
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                No sales orders yet
                            </p>
                            <Link href="/sales-orders/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Order
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Order #
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Customer
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Status
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Total
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Items
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                                                {order.orderNumber}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {order.customer.name}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {formatDate(order.orderDate)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'DRAFT'
                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                                                            : order.status === 'CONFIRMED'
                                                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                                : order.status === 'FULFILLED'
                                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                                    : order.status === 'INVOICED'
                                                                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                                                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                                                {formatCurrency(Number(order.total))}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-slate-600 dark:text-slate-400">
                                                {order.items.length}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/sales-orders/${order.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
