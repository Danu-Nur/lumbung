import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatsCard({ title, value, icon: Icon, trend, color = 'blue' }: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    };

    return (
        <Card>
            <CardContent className="flex items-center justify-between p-6">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">{title}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-1 ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trend.isPositive ? '+' : ''}{trend.value}% from last month
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}
