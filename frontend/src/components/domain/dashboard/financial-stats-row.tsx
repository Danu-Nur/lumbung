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
    const t = useTranslations('dashboard.financial'); // Assuming standard keys, will fallback or need update

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatsCard
                title={t('purchase')}
                value={formatCurrency(data.totalPurchases)}
                icon={ShoppingCart}
                color="blue"
            />
            <StatsCard
                title={t('stockValue')}
                value={formatCurrency(data.totalStockValue)}
                icon={Package}
                color="purple"
            />
            <StatsCard
                title={t('sales')}
                value={formatCurrency(data.totalSales)}
                icon={DollarSign}
                color="green"
            />
            <StatsCard
                title={t('profit')}
                value={formatCurrency(data.profit)}
                icon={TrendingUp}
                color="orange"
            />
        </div>
    );
}
