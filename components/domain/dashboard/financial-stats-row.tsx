import { StatsCard } from "@/components/shared/stats-card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface FinancialStatsRowProps {
    data: {
        totalPurchases: number;
        totalStockValue: number;
        totalSales: number;
        profit: number;
    }
}

export function FinancialStatsRow({ data }: FinancialStatsRowProps) {
    const t = useTranslations('dashboard.metrics'); // Assuming standard keys, will fallback or need update

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatsCard
                title="Total Purchase"
                value={formatCurrency(data.totalPurchases)}
                icon={ShoppingCart}
                color="blue"
            />
            <StatsCard
                title="Total Stock Value"
                value={formatCurrency(data.totalStockValue)}
                icon={Package}
                color="purple"
            />
            <StatsCard
                title="Total Sales"
                value={formatCurrency(data.totalSales)}
                icon={DollarSign}
                color="green"
            />
            <StatsCard
                title="Profit"
                value={formatCurrency(data.profit)}
                icon={TrendingUp}
                color="orange"
            />
        </div>
    );
}
