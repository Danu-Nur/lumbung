import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface LowStockItem {
    id: string;
    quantityOnHand: number;
    product: {
        name: string;
        unit: string;
        lowStockThreshold: number;
    };
    warehouse: {
        name: string;
    };
}

interface LowStockItemsCardProps {
    items: LowStockItem[];
}

export function LowStockItemsCard({ items }: LowStockItemsCardProps) {
    const t = useTranslations('dashboard.widgets.lowStock');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span>{t('title')}</span>
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                    <Link href="/inventory">{t('viewAll')}</Link>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto pt-2">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {t('empty')}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/30"
                            >
                                <div className="min-w-0 flex-1 mr-2">
                                    <p className="font-medium text-sm truncate" title={item.product.name}>
                                        {item.product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {item.warehouse.name}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <Badge variant="destructive" className="mb-0.5 text-xs">
                                        {item.quantityOnHand} {item.product.unit}
                                    </Badge>
                                    <p className="text-[10px] text-muted-foreground">
                                        {t('min')} {item.product.lowStockThreshold}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
