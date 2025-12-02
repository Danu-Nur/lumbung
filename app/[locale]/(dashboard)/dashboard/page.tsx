import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { StatsCard } from '@/components/shared/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

async function getDashboardStats(organizationId: string) {
    // Get total products
    const totalProducts = await prisma.product.count({
        where: { organizationId, deletedAt: null },
    });

    // Get total stock value
    const inventoryItems = await prisma.inventoryItem.findMany({
        where: {
            product: { organizationId },
        },
        include: {
            product: true,
        },
    });

    const totalStockValue = inventoryItems.reduce((sum, item) => {
        return sum + item.quantityOnHand * Number(item.product.costPrice);
    }, 0);

    // Get active sales orders
    const activeSalesOrders = await prisma.salesOrder.count({
        where: {
            organizationId,
            status: { in: ['DRAFT', 'CONFIRMED'] },
        },
    });

    // Get low stock items
    const lowStockItems = await prisma.inventoryItem.findMany({
        where: {
            product: {
                organizationId,
                deletedAt: null,
            },
        },
        include: {
            product: true,
            warehouse: true,
        },
    });

    const lowStockCount = lowStockItems.filter(
        (item) => item.quantityOnHand <= item.product.lowStockThreshold
    ).length;

    return {
        totalProducts,
        totalStockValue,
        activeSalesOrders,
        lowStockCount,
        lowStockItems: lowStockItems
            .filter((item) => item.quantityOnHand <= item.product.lowStockThreshold)
            .slice(0, 5),
    };
}

async function getRecentInventoryChanges(organizationId: string) {
    const recentChanges = await prisma.inventoryMovement.findMany({
        where: {
            product: { organizationId },
        },
        include: {
            product: true,
            warehouse: true,
            createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });

    return recentChanges;
}

export default async function DashboardPage() {
    const session = await auth();
    const t = await getTranslations('common');
    // We can add specific dashboard translations later if needed, but common might suffice for now or we create a dashboard section in en.json/id.json

    if (!session?.user) {
        redirect('/login');
    }

    if (!session.user.organizationId) {
        // Super Admin - show message or redirect
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Super Admin Dashboard
                    </h2>
                    <p className="text-muted-foreground">
                        Select an organization to view its dashboard
                    </p>
                </div>
            </div>
        );
    }

    const stats = await getDashboardStats(session.user.organizationId);
    const recentChanges = await getRecentInventoryChanges(session.user.organizationId);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <PageHeader
                title={t('nav.dashboard')}
                description={`Welcome back, ${session.user.name}`}
                help={
                    <div className="space-y-4">
                        <p>The Dashboard provides an overview of your inventory status.</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Total Products:</strong> Number of active products.</li>
                            <li><strong>Total Stock Value:</strong> Value of all items in stock (Cost Price * Quantity).</li>
                            <li><strong>Active Orders:</strong> Sales orders that are in Draft or Confirmed status.</li>
                            <li><strong>Low Stock Items:</strong> Items that have fallen below their minimum stock level.</li>
                        </ul>
                    </div>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                <StatsCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    color="blue"
                />
                <StatsCard
                    title="Total Stock Value"
                    value={formatCurrency(stats.totalStockValue)}
                    icon={DollarSign}
                    color="green"
                />
                <StatsCard
                    title="Active Orders"
                    value={stats.activeSalesOrders}
                    icon={ShoppingCart}
                    color="purple"
                />
                <StatsCard
                    title="Low Stock Items"
                    value={stats.lowStockCount}
                    icon={AlertTriangle}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
                {/* Low Stock Items */}
                <Card className="flex flex-col h-full max-h-[600px] lg:max-h-[calc(100vh-340px)]">
                    <CardHeader className="shrink-0">
                        <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            <span>Low Stock Items</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto flex-1 pr-2">
                        {stats.lowStockItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                All items are well stocked!
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {stats.lowStockItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/30"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {item.product.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.warehouse.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="destructive" className="mb-1">
                                                {item.quantityOnHand} {item.product.unit}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                Min: {item.product.lowStockThreshold}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Inventory Changes */}
                <Card className="flex flex-col h-full max-h-[600px] lg:max-h-[calc(100vh-340px)]">
                    <CardHeader className="shrink-0">
                        <CardTitle>Recent Inventory Changes</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto flex-1 pr-2">
                        {recentChanges.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No recent changes
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentChanges.map((change) => (
                                    <div
                                        key={change.id}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">
                                                {change.product.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {change.warehouse.name} • {change.createdBy.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`font-bold ${change.quantity > 0
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-red-600 dark:text-red-400'
                                                    }`}
                                            >
                                                {change.quantity > 0 ? '+' : ''}
                                                {change.quantity}
                                            </p>
                                            <Badge variant="outline" className="text-xs mt-1">
                                                {change.movementType}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
