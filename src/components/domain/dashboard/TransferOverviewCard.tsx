import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface TransferData {
    id: string;
    fromWarehouse: { name: string };
    toWarehouse: { name: string };
    status: string;
}

interface TransferOverviewData {
    pendingCount: number;
    recentTransfers: TransferData[];
}

interface TransferOverviewCardProps {
    data: TransferOverviewData;
}

export function TransferOverviewCard({ data }: TransferOverviewCardProps) {
    const t = useTranslations('dashboard.widgets.transfers');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                    <span>{t('title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto pt-2 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('pendingTransfers')}</span>
                    <Badge variant={data.pendingCount > 0 ? "default" : "secondary"}>
                        {data.pendingCount}
                    </Badge>
                </div>

                <div className="space-y-3 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground uppercase">{t('recent')}</p>
                    {data.recentTransfers.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">{t('empty')}</p>
                    ) : (
                        data.recentTransfers.map((transfer) => (
                            <div key={transfer.id} className="text-sm border-b last:border-0 pb-2 last:pb-0">
                                <div className="flex items-center justify-between mb-1">
                                    <Badge variant="outline" className="text-[10px] h-5">{transfer.status}</Badge>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <span className="truncate max-w-[40%]">{transfer.fromWarehouse.name}</span>
                                    <ArrowRightLeft className="w-3 h-3 mx-1 shrink-0" />
                                    <span className="truncate max-w-[40%]">{transfer.toWarehouse.name}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
