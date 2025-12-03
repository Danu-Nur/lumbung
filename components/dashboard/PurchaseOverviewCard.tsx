import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';

interface PurchaseOverviewData {
    todayCount: number;
    todayValue: number;
    openPurchasesCount: number;
}

interface PurchaseOverviewCardProps {
    data: PurchaseOverviewData;
}

export function PurchaseOverviewCard({ data }: PurchaseOverviewCardProps) {
    const t = useTranslations('dashboard.widgets.purchases');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>{t('title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-2 space-y-4">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{t('today')}</p>
                    <div className="flex items-baseline justify-between">
                        <p className="text-lg font-bold">{formatCurrency(data.todayValue)}</p>
                        <p className="text-xs text-muted-foreground">{data.todayCount} {t('orders')}</p>
                    </div>
                </div>

                <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('openOrders')}</span>
                        <span className="font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs">
                            {data.openPurchasesCount}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
