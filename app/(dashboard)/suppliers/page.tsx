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
import { Plus, Building2 } from 'lucide-react';
import Link from 'next/link';

async function getSuppliers(organizationId: string) {
    return await prisma.supplier.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function SuppliersPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const suppliers = await getSuppliers(session.user.organizationId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Suppliers
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your supplier database
                    </p>
                </div>
                <Link href="/suppliers/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                    {suppliers.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No suppliers yet
                            </p>
                            <Link href="/suppliers/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Supplier
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
                                {suppliers.map((supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell className="font-medium">
                                            {supplier.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {supplier.email || '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {supplier.phone || '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {supplier.city || '-'}
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
