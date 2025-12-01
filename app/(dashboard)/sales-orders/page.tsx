import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
                    <h1 className="text-3xl font-bold text-foreground">
                        Sales Orders
                    </h1>
                    <p className="text-muted-foreground mt-1">
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
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Items</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            {order.orderNumber}
                                        </TableCell>
                                        <TableCell>
                                            {order.customer.name}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(order.orderDate)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    order.status === 'DRAFT' ? 'secondary' :
                                                        order.status === 'CONFIRMED' ? 'default' :
                                                            order.status === 'FULFILLED' ? 'outline' : // Greenish usually
                                                                order.status === 'INVOICED' ? 'outline' :
                                                                    'destructive'
                                                }
                                                className={
                                                    order.status === 'FULFILLED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100' :
                                                        order.status === 'INVOICED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 hover:bg-purple-100' :
                                                            ''
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(Number(order.total))}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {order.items.length}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/sales-orders/${order.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
