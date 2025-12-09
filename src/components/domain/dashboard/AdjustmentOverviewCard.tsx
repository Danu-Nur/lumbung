import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AdjustmentData {
    id: string;
    reason: string;
    quantity: number;
    adjustmentType: string;
    product: { name: string };
}

interface AdjustmentOverviewData {
    recentAdjustments: AdjustmentData[];
}

interface AdjustmentOverviewCardProps {
    data: AdjustmentOverviewData;
}

export function AdjustmentOverviewCard({ data }: AdjustmentOverviewCardProps) {
    const t = useTranslations('dashboard.widgets.adjustments');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                    <span>{t('title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto pt-2">
                {data.recentAdjustments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('empty')}</p>
                ) : (
                    <div className="space-y-3">
                        {data.recentAdjustments.map((adj) => (
                            <div key={adj.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                                <div className="min-w-0 flex-1 mr-2">
                                    <p className="font-medium truncate">{adj.product.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{adj.reason}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`font-bold ${adj.adjustmentType === 'increase' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {adj.adjustmentType === 'increase' ? '+' : '-'}{Math.abs(adj.quantity)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
