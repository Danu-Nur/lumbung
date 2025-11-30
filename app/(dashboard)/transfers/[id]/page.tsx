import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { completeStockTransfer } from '@/features/transfers/actions';

async function getTransfer(transferId: string, organizationId: string) {
    return await prisma.stockTransfer.findFirst({
        where: {
            id: transferId,
            organizationId,
        },
        include: {
            fromWarehouse: true,
            toWarehouse: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
}

export default async function TransferDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const transfer = await getTransfer(params.id, session.user.organizationId);

    if (!transfer) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/transfers">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {transfer.transferNumber}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {formatDate(transfer.transferDate)}
                        </p>
                    </div>
                </div>
                {transfer.status === 'IN_TRANSIT' && (
                    <form action={completeStockTransfer.bind(null, transfer.id)}>
                        <Button type="submit">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Transfer
                        </Button>
                    </form>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transfer Details */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transfer Items</CardTitle>
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
                                                Quantity
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transfer.items.map((item) => (
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
                                                <td className="text-right py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                                                    {item.quantity} {item.product.unit}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transfer Info Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transfer Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${transfer.status === 'DRAFT'
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                                        : transfer.status === 'IN_TRANSIT'
                                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : transfer.status === 'COMPLETED'
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                    }`}
                            >
                                {transfer.status}
                            </span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>From Warehouse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {transfer.fromWarehouse.name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {transfer.fromWarehouse.code}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>To Warehouse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {transfer.toWarehouse.name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {transfer.toWarehouse.code}
                            </p>
                        </CardContent>
                    </Card>

                    {transfer.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {transfer.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
