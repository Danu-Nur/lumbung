'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface SalesChartProps {
    data: {
        date: string;
        total: number;
    }[];
}

export function SalesChart({ data }: SalesChartProps) {
    const t = useTranslations('dashboard.charts.sales');

    // Format date for display (e.g., "Mon", "Tue")
    const formattedData = data.map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    }));

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>{t('title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-2">
                <div className="h-full w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="displayDate"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f3f4f6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [formatCurrency(value), t('sales')]}
                            />
                            <Line
                                dataKey="total"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                type="monotone"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
