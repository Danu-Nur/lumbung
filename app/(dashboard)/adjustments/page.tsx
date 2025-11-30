import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Stock Adjustments
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
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
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
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
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Product
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Warehouse
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Type
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Quantity
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Reason
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            By
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adjustments.map((adjustment) => (
                                        <tr
                                            key={adjustment.id}
                                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {formatDateTime(adjustment.createdAt)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                                    {adjustment.product.name}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {adjustment.product.sku}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {adjustment.warehouse.name}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${adjustment.adjustmentType === 'increase'
                                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                        }`}
                                                >
                                                    {adjustment.adjustmentType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span
                                                    className={`font-bold ${adjustment.adjustmentType === 'increase'
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                        }`}
                                                >
                                                    {adjustment.adjustmentType === 'increase' ? '+' : '-'}
                                                    {adjustment.quantity}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {adjustment.reason}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {adjustment.createdBy.name}
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
