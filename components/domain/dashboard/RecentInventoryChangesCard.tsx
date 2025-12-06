import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface InventoryChange {
    id: string;
    quantity: number;
    movementType: string;
    createdAt: Date;
    product: {
        name: string;
    };
    warehouse: {
        name: string;
    };
    createdBy: {
        name: string | null;
    };
}

interface RecentInventoryChangesCardProps {
    changes: InventoryChange[];
}

export function RecentInventoryChangesCard({ changes }: RecentInventoryChangesCardProps) {
    const t = useTranslations('dashboard.widgets.recentChanges');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <History className="w-4 h-4" />
                    <span>{t('title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto pt-2">
                {changes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {t('empty')}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {changes.map((change) => (
                            <div
                                key={change.id}
                                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border"
                            >
                                <div className="min-w-0 flex-1 mr-2">
                                    <p className="font-medium text-sm truncate" title={change.product.name}>
                                        {change.product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {change.warehouse.name} • {change.createdBy.name}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p
                                        className={`font-bold text-sm ${change.quantity > 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}
                                    >
                                        {change.quantity > 0 ? '+' : ''}
                                        {change.quantity}
                                    </p>
                                    <Badge variant="outline" className="text-[10px] mt-0.5 h-5">
                                        {change.movementType}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
