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
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

async function getAdjustments(organizationId: string) {
    const adjustments = await prisma.stockAdjustment.findMany({
        where: { organizationId },
        include: {
            product: true,
            warehouse: true,
            createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    return adjustments;
}

export default async function AdjustmentsPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const adjustments = await getAdjustments(session.user.organizationId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Stock Adjustments
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage inventory adjustments
                    </p>
                </div>
                <Link href="/adjustments/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Adjustment
                    </Button>
                </Link>
            </div>

            {/* Adjustments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Adjustments</CardTitle>
                </CardHeader>
                <CardContent>
                    {adjustments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">
                                No adjustments yet
                            </p>
                            <Link href="/adjustments/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Adjustment
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Warehouse</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adjustments.map((adjustment) => (
                                    <TableRow key={adjustment.id}>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDateTime(adjustment.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-foreground">
                                                {adjustment.product.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {adjustment.product.sku}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {adjustment.warehouse.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={adjustment.adjustmentType === 'increase' ? 'default' : 'destructive'}>
                                                {adjustment.adjustmentType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={`font-bold ${adjustment.adjustmentType === 'increase'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-red-600 dark:text-red-400'
                                                    }`}
                                            >
                                                {adjustment.adjustmentType === 'increase' ? '+' : '-'}
                                                {adjustment.quantity}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {adjustment.reason}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {adjustment.createdBy.name}
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
