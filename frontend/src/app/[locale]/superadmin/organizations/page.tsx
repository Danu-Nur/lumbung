import { prisma } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default async function OrganizationsPage() {
    const organizations = await prisma.organization.findMany({
        include: {
            subscription: {
                include: { plan: true },
            },
            _count: {
                select: { users: true, warehouses: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Organizations</h1>
                {/* <Button>Add Organization</Button> */}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Warehouses</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {organizations.map((org) => (
                            <TableRow key={org.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/superadmin/organizations/${org.id}`} className="hover:underline text-primary">
                                        {org.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{org.slug}</TableCell>
                                <TableCell>
                                    {org.subscription ? (
                                        <Badge variant="outline">{org.subscription.plan.name}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {org.subscription ? (
                                        <Badge variant={org.subscription.status === "ACTIVE" ? "default" : "secondary"}>
                                            {org.subscription.status}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>{org._count.users}</TableCell>
                                <TableCell>{org._count.warehouses}</TableCell>
                                <TableCell>{org.createdAt.toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
