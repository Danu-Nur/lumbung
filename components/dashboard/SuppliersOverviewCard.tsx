import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SupplierData {
    id: string;
    name: string;
    email: string | null;
}

interface SupplierOverviewData {
    totalSuppliers: number;
    recentSuppliers: SupplierData[];
}

interface SuppliersOverviewCardProps {
    data: SupplierOverviewData;
}

export function SuppliersOverviewCard({ data }: SuppliersOverviewCardProps) {
    const t = useTranslations('dashboard.widgets.suppliers');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <Factory className="w-4 h-4 text-slate-600" />
                    <span>{t('title')}</span>
                </CardTitle>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('totalSuppliers')}</span>
                    <span className="text-xl font-bold">{data.totalSuppliers}</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase pb-2 border-b">{t('newest')}</p>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto pt-2 space-y-4">
                <div className="space-y-3">
                    {data.recentSuppliers.map((supplier) => (
                        <div key={supplier.id} className="flex items-center justify-between text-sm">
                            <div className="min-w-0">
                                <p className="font-medium truncate">{supplier.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{supplier.email || '-'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
