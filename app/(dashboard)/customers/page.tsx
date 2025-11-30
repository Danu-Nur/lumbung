import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';

async function getCustomers(organizationId: string) {
    return await prisma.customer.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function CustomersPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const customers = await getCustomers(session.user.organizationId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Customers
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage your customer database
                    </p>
                </div>
                <Link href="/customers/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Customer
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    {customers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                No customers yet
                            </p>
                            <Link href="/customers/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Customer
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Name
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Email
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Phone
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            City
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                                    {customer.name}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {customer.email || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {customer.phone || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {customer.city || '-'}
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
