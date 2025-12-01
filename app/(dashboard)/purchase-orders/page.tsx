import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingBag } from 'lucide-react';
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

async function getPurchaseOrders(organizationId: string) {
    return await prisma.purchaseOrder.findMany({
        where: { organizationId },
        include: {
            supplier: true,
            warehouse: true,
            items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
}

export default async function PurchaseOrdersPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const orders = await getPurchaseOrders(session.user.organizationId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Purchase Orders
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage supplier orders
                    </p>
                </div>
                <Link href="/purchase-orders/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New PO
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No purchase orders yet
                            </p>
                            <Link href="/purchase-orders/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First PO
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PO #</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            {order.poNumber}
                                        </TableCell>
                                        <TableCell>
                                            {order.supplier.name}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(order.orderDate)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    order.status === 'DRAFT' ? 'secondary' :
                                                        order.status === 'SENT' ? 'default' :
                                                            order.status === 'COMPLETED' ? 'outline' : // Greenish
                                                                'destructive'
                                                }
                                                className={
                                                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100' :
                                                        ''
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(Number(order.total))}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/purchase-orders/${order.id}`}>
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
