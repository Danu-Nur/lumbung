import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CustomerData {
    id: string;
    name: string;
    email: string | null;
}

interface CustomerOverviewData {
    totalCustomers: number;
    recentCustomers: CustomerData[];
}

interface CustomersOverviewCardProps {
    data: CustomerOverviewData;
}

export function CustomersOverviewCard({ data }: CustomersOverviewCardProps) {
    const t = useTranslations('dashboard.widgets.customers');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <Users className="w-4 h-4 text-cyan-600" />
                    <span>{t('title')}</span>
                </CardTitle>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('totalCustomers')}</span>
                    <span className="text-xl font-bold">{data.totalCustomers}</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase pb-2 border-b">{t('newest')}</p>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto pt-2 space-y-4">
                <div className="space-y-3">
                    {data.recentCustomers.map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between text-sm">
                            <div className="min-w-0">
                                <p className="font-medium truncate">{customer.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{customer.email || '-'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
