import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';

interface SalesOverviewData {
    todayCount: number;
    todayValue: number;
    monthCount: number;
    monthValue: number;
    openOrdersCount: number;
}

interface SalesOverviewCardProps {
    data: SalesOverviewData;
}

export function SalesOverviewCard({ data }: SalesOverviewCardProps) {
    const t = useTranslations('dashboard.widgets.sales');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    <span>{t('title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('today')}</p>
                        <p className="text-lg font-bold">{formatCurrency(data.todayValue)}</p>
                        <p className="text-xs text-muted-foreground">{data.todayCount} {t('orders')}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('thisMonth')}</p>
                        <p className="text-lg font-bold">{formatCurrency(data.monthValue)}</p>
                        <p className="text-xs text-muted-foreground">{data.monthCount} {t('orders')}</p>
                    </div>
                </div>

                <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('openOrders')}</span>
                        <span className="font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                            {data.openOrdersCount}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
