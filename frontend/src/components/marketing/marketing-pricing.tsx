"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { PricingPlan } from "@/types/marketing";
import { getPricingPlans } from "@/services/marketingService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function MarketingPricing() {
    const t = useTranslations("Landing");
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    useEffect(() => {
        const fetchPlans = async () => {
            const data = await getPricingPlans();
            setPlans(data);
            setLoading(false);
        };
        fetchPlans();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <section
            id="pricing"
            className="container py-12 md:py-24 lg:py-32 mx-auto"
        >
            <ScrollAnimation>
                <div className="mx-auto flex max-w-2xl flex-col items-center space-y-4 text-center mb-10">
                    <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                        {t("pricing.title")}
                    </h2>
                    <p className="text-muted-foreground sm:text-lg">
                        {t("pricing.subtitle")}
                    </p>

                    {/* Billing Cycle Toggle */}
                    <div className="flex items-center justify-center space-x-4 mt-8">
                        <Label
                            htmlFor="billing-mode"
                            className={cn(
                                "cursor-pointer font-bold transition-colors",
                                billingCycle === "monthly" ? "text-black" : "text-neutral-400"
                            )}>
                            {t("pricing.monthly")}
                        </Label>

                        <Switch
                            id="billing-mode"
                            checked={billingCycle === "yearly"}
                            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
                            className="data-[state=checked]:bg-black data-[state=unchecked]:bg-neutral-300 border-2 border-black dark:border-white"
                        />

                        <Label
                            htmlFor="billing-mode"
                            className={cn(
                                "cursor-pointer font-bold transition-colors",
                                billingCycle === "yearly" ? "text-black" : "text-neutral-400"
                            )}>
                            {t("pricing.yearly")}
                        </Label>
                    </div>
                    {billingCycle === "yearly" && (
                        <span className="text-xs font-bold bg-yellow-300 px-2 py-1 border border-black px-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_white] -rotate-2">
                            Full Year (Hemat 2 Bulan)
                        </span>
                    )}
                </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8 max-w-7xl mx-auto">
                {plans.map((plan, index) => {
                    const isPopular = plan.popular;
                    const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

                    return (
                        <ScrollAnimation
                            key={plan.id}
                            delay={index * 0.1}
                            animation="fade-up"
                            className="h-full"
                        >
                            <div
                                className={cn(
                                    "flex flex-col h-full border-2 border-black dark:border-white p-6 transition-all duration-200",
                                    isPopular
                                        ? "bg-yellow-300 dark:bg-yellow-400 dark:text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] -translate-y-2 z-10"
                                        : "bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] hover:-translate-y-1"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 -mt-3 -mr-3 transform rotate-3">
                                        <div className="bg-black text-white font-bold px-3 py-1 border-2 border-white text-sm shadow-sm uppercase tracking-widest">
                                            {t("pricing.popularBadge")}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-black dark:text-inherit">{plan.name}</h3>
                                    <p className="text-sm font-medium text-black/60 dark:text-inherit mt-2 leading-relaxed border-b-2 border-black/10 dark:border-current pb-4">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <div className="text-3xl font-black mb-6 flex items-baseline text-black dark:text-inherit">
                                        <span className="tracking-tight">{formatPrice(price)}</span>
                                        <span className="text-base font-bold text-black/40 dark:text-inherit ml-1">
                                            /{billingCycle === "monthly" ? "mo" : "yr"}
                                        </span>
                                    </div>
                                    <ul className="space-y-3 text-sm font-medium">
                                        {plan.features.map((feat, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start"
                                            >
                                                <CheckCircle2 className="mr-2 h-5 w-5 text-black dark:text-inherit shrink-0" />
                                                <span className="leading-tight text-black dark:text-inherit">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <Button
                                        className="w-full"
                                        variant={isPopular ? "outline" : "default"}
                                    >
                                        {t("pricing.choosePlan")} {plan.name}
                                    </Button>
                                </div>
                            </div>
                        </ScrollAnimation>
                    );
                })}
            </div>
        </section>
    );
}
