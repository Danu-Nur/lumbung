import { StatsCard } from "@/components/shared/stats-card";
import { Users, Building2, Package, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface OperationalStatsRowProps {
    data: {
        totalCustomers: number;
        totalSuppliers: number;
        totalProducts: number;
        totalSalesInvoices: number;
    }
}

export function OperationalStatsRow({ data }: OperationalStatsRowProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatsCard
                title="Total Customers"
                value={data.totalCustomers}
                icon={Users}
                color="blue"
                variant="filled"
            />
            <StatsCard
                title="Total Suppliers"
                value={data.totalSuppliers}
                icon={Building2}
                color="purple"
                variant="filled"
            />
            <StatsCard
                title="Total Products"
                value={data.totalProducts}
                icon={Package}
                color="green"
                variant="filled"
            />
            <StatsCard
                title="Total Sales Invoices"
                value={data.totalSalesInvoices}
                icon={FileText}
                color="orange"
                variant="filled"
            />
        </div>
    );
}
