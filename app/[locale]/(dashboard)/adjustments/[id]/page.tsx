import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { reverseStockAdjustment } from '@/features/adjustments/actions';

async function getAdjustment(id: string, organizationId: string) {
    return await prisma.stockAdjustment.findFirst({
        where: { id, organizationId },
        include: {
            product: true,
            warehouse: true,
            createdBy: true,
        },
    });
}

export default async function AdjustmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const adjustment = await getAdjustment(id, session.user.organizationId);

    if (!adjustment) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/adjustments">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Adjustment Details
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {formatDateTime(adjustment.createdAt)}
                        </p>
                    </div>
                </div>
                <form action={reverseStockAdjustment.bind(null, adjustment.id)}>
                    <Button variant="destructive">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reverse Adjustment
                    </Button>
                </form>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Adjustment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Product
                            </label>
                            <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                                {adjustment.product.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {adjustment.product.sku}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Warehouse
                            </label>
                            <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                                {adjustment.warehouse.name}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Type
                            </label>
                            <div className="mt-1">
                                <Badge variant={adjustment.adjustmentType === 'increase' ? 'default' : 'destructive'}>
                                    {adjustment.adjustmentType.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Quantity
                            </label>
                            <p className={`text-base font-bold mt-1 ${adjustment.adjustmentType === 'increase'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                                }`}>
                                {adjustment.adjustmentType === 'increase' ? '+' : '-'}
                                {adjustment.quantity} {adjustment.product.unit}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Reason
                            </label>
                            <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                                {adjustment.reason}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Created By
                            </label>
                            <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                                {adjustment.createdBy.name}
                            </p>
                        </div>
                    </div>

                    {adjustment.notes && (
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Notes
                            </label>
                            <p className="text-base text-slate-900 dark:text-slate-100 mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                {adjustment.notes}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
