import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

async function getTransfers(organizationId: string) {
    return await prisma.stockTransfer.findMany({
        where: { organizationId },
        include: {
            fromWarehouse: true,
            toWarehouse: true,
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

export default async function TransfersPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const transfers = await getTransfers(session.user.organizationId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Stock Transfers
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Transfer inventory between warehouses
                    </p>
                </div>
                <Link href="/transfers/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Transfer
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                    {transfers.length === 0 ? (
                        <div className="text-center py-12">
                            <ArrowLeftRight className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                No transfers yet
                            </p>
                            <Link href="/transfers/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Transfer
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Transfer #
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            From
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            To
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Status
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
                                    {transfers.map((transfer) => (
                                        <tr
                                            key={transfer.id}
                                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                                                {transfer.transferNumber}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {transfer.fromWarehouse.name}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {transfer.toWarehouse.name}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {formatDate(transfer.transferDate)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transfer.status === 'DRAFT'
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
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-slate-600 dark:text-slate-400">
                                                {transfer.items.length}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/transfers/${transfer.id}`}>
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
