'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface DashboardChartsSectionProps {
    monthlyData: {
        month: string;
        sales: number;
        purchase: number;
        profit: number;
    }[];
    yearlyData: {
        sales: number;
        purchase: number;
        profit: number;
    }
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b']; // emerald, red, amber

export function DashboardChartsSection({ monthlyData, yearlyData }: DashboardChartsSectionProps) {
    const pieData = [
        { name: 'Sales', value: yearlyData.sales },
        { name: 'Purchase', value: yearlyData.purchase },
        { name: 'Profit', value: yearlyData.profit > 0 ? yearlyData.profit : 0 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart - Monthly Data */}
            <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg font-semibold">Financial Overview (Monthly)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] sm:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6B7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <YAxis
                                    tickFormatter={(value) => `$${value}`}
                                    stroke="#6B7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="sales" name="Sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                                <Area type="monotone" dataKey="purchase" name="Purchase" stroke="#ef4444" fillOpacity={1} fill="url(#colorPurchase)" strokeWidth={2} />
                                <Area type="monotone" dataKey="profit" name="Profit" stroke="#f59e0b" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Pie Chart - Yearly Data */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg font-semibold">Composition (Yearly)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] sm:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
