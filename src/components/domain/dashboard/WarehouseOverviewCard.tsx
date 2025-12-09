import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Warehouse } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';

interface WarehouseData {
    id: string;
    name: string;
    stockValue: number;
    itemCount: number;
}

interface WarehouseOverviewData {
    totalWarehouses: number;
    topWarehouses: WarehouseData[];
}

interface WarehouseOverviewCardProps {
    data: WarehouseOverviewData;
}

export function WarehouseOverviewCard({ data }: WarehouseOverviewCardProps) {
    const t = useTranslations('dashboard.widgets.warehouses');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <Warehouse className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>{t('title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto pt-2 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('totalWarehouses')}</span>
                    <span className="text-xl font-bold">{data.totalWarehouses}</span>
                </div>

                <div className="space-y-3 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground uppercase">{t('topByValue')}</p>
                    {data.topWarehouses.map((wh) => (
                        <div key={wh.id} className="flex items-center justify-between text-sm">
                            <span className="truncate flex-1 mr-2">{wh.name}</span>
                            <div className="text-right">
                                <p className="font-medium">{formatCurrency(wh.stockValue)}</p>
                                <p className="text-[10px] text-muted-foreground">{wh.itemCount} {t('items')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
