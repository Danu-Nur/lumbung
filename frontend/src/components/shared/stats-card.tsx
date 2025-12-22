import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'purple' | 'orange';
    variant?: 'default' | 'filled';
}

export function StatsCard({ title, value, icon: Icon, trend, color = 'blue', variant = 'default' }: StatsCardProps) {
    const t = useTranslations('common.statsCard');

    // Default styles (neutral card, colored icon bg)
    const defaultColorClasses = {
        blue: 'neo-icon-blue text-white dark:border-white',
        green: 'neo-icon-emerald text-white dark:border-white',
        purple: 'neo-icon-purple text-white dark:border-white',
        orange: 'neo-icon-amber text-white dark:border-white',
    };

    // Filled styles (colored card, white/light text)
    const filledColorClasses = {
        blue: 'bg-blue-600 text-white',
        green: 'bg-emerald-600 text-white',
        purple: 'bg-purple-600 text-white',
        orange: 'bg-orange-600 text-white',
    };

    if (variant === 'filled') {
        const bgClass = filledColorClasses[color];
        return (
            <Card className={`${bgClass}`}>
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <p className="text-sm sm:text-base font-medium text-white/80 mb-1">{title}</p>
                        <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
                        {trend && (
                            <p className="text-xs sm:text-sm mt-1 text-white/90">
                                {trend.isPositive ? '+' : ''}{trend.value}% {t('fromLastMonth')}
                            </p>
                        )}
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-none border border-white bg-white/20 flex items-center justify-center text-white">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Default Variant
    const iconClass = defaultColorClasses[color];

    return (
        <Card>
            <CardContent className="flex items-center justify-between p-6">
                <div>
                    <p className="text-sm sm:text-base text-muted-foreground mb-1">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
                    {trend && (
                        <p className={`text-xs sm:text-sm mt-1 ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trend.isPositive ? '+' : ''}{trend.value}% {t('fromLastMonth')}
                        </p>
                    )}
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-none border-2 border-black flex items-center justify-center ${iconClass}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
            </CardContent>
        </Card>
    );
}
