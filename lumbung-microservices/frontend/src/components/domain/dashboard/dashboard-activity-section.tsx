import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackagePlus } from "lucide-react";
import { LowStockItemsCard } from "./LowStockItemsCard";
import { RecentInventoryChangesCard } from "./RecentInventoryChangesCard";
import { WarehouseOverviewCard } from "./WarehouseOverviewCard";
import { formatDateTime } from "@/lib/utils";

interface DashboardActivitySectionProps {
    recentProducts: {
        id: string;
        name: string;
        sku: string;
        createdAt: Date;
    }[];
    lowStockItems: any[]; // Using any to match existing component prop type or infer it
    recentChanges: any[];
    warehouseData: any;
}

import { useTranslations } from "next-intl";

export function DashboardActivitySection({
    recentProducts,
    lowStockItems,
    recentChanges,
    warehouseData
}: DashboardActivitySectionProps) {
    const t = useTranslations('dashboard.widgets.activity');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Recently Added Products */}
            <Card className="flex flex-col h-[400px]">
                <CardHeader className="shrink-0 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center space-x-2 text-base sm:text-lg font-medium">
                        <PackagePlus className="w-4 h-4 text-primary" />
                        <span>{t('recentlyAdded.title')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-y-auto pt-2">
                    {recentProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {t('recentlyAdded.empty')}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                                >
                                    <div className="min-w-0 flex-1 mr-2">
                                        <p className="font-medium text-sm truncate" title={product.name}>
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {t('sku')}: {product.sku}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] text-muted-foreground">
                                            {formatDateTime(product.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Low Stock Items (Existing) */}
            <div className="h-[400px]">
                <LowStockItemsCard items={lowStockItems} />
            </div>

            {/* Recent Inventory Movements (Existing) */}
            <div className="h-[400px]">
                <RecentInventoryChangesCard changes={recentChanges} />
            </div>

            {/* Warehouse Overview (Existing) */}
            <div className="h-[400px]">
                <WarehouseOverviewCard data={warehouseData} />
            </div>
        </div>
    );
}
