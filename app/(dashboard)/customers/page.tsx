import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
                    <h1 className="text-3xl font-bold text-foreground">
                        Customers
                    </h1>
                    <p className="text-muted-foreground mt-1">
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
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>City</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium">
                                            {customer.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {customer.email || '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {customer.phone || '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {customer.city || '-'}
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
