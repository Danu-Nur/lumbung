"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Check } from "lucide-react";
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
                    <h2 className="font-heading text-4xl font-black leading-[1.1] sm:text-4xl md:text-6xl uppercase tracking-tighter text-black dark:text-white">
                        {t("pricing.title")}
                    </h2>
                    <p className="font-bold text-lg text-black dark:text-neutral-400">
                        {t("pricing.subtitle")}
                    </p>

                    {/* Billing Cycle Toggle */}
                    <div className="flex items-center justify-center space-x-4 mt-8 bg-neutral-100 dark:bg-neutral-800 p-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white]">
                        <Label
                            htmlFor="billing-mode"
                            className={cn(
                                "cursor-pointer font-black uppercase transition-colors px-2",
                                billingCycle === "monthly" ? "text-black dark:text-white underline decoration-2 decoration-black dark:decoration-white" : "text-neutral-400"
                            )}>
                            {t("pricing.monthly")}
                        </Label>

                        <Switch
                            id="billing-mode"
                            checked={billingCycle === "yearly"}
                            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
                            className="bg-neutral-300 data-[state=checked]:bg-black border-2 border-black dark:border-white"
                        />

                        <Label
                            htmlFor="billing-mode"
                            className={cn(
                                "cursor-pointer font-black uppercase transition-colors px-2",
                                billingCycle === "yearly" ? "text-black dark:text-white underline decoration-2 decoration-black dark:decoration-white" : "text-neutral-400"
                            )}>
                            {t("pricing.yearly")}
                        </Label>
                    </div>
                    {billingCycle === "yearly" && (
                        <div className="relative">
                            <span className="text-xs font-black uppercase tracking-widest bg-yellow-300 text-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] absolute left-1/2 -translate-x-1/2 top-2 transform rotate-2 whitespace-nowrap">
                                Best Value (Save 2 Months)
                            </span>
                        </div>
                    )}
                </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto pt-10">
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
                                    "flex flex-col h-full border-2 border-black dark:border-white p-6 transition-all duration-200 relative",
                                    isPopular
                                        ? "bg-yellow-300 dark:bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] -translate-y-2 z-10"
                                        : "bg-white dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_#ffffff] hover:-translate-y-1"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 z-20">
                                        <div className="bg-black text-white font-black px-4 py-1 border-2 border-white text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-12">
                                            POPULAR
                                        </div>
                                    </div>
                                )}

                                <div className="mb-6 border-b-2 border-black/10 dark:border-white/20 pb-6">
                                    <h3 className={cn("text-2xl font-black uppercase tracking-tighter", isPopular ? "text-black" : "text-black dark:text-white")}>{plan.name}</h3>
                                    <p className={cn("text-sm font-bold mt-2 leading-relaxed bg-white/50 p-2 border-l-2 border-black dark:border-white/50", isPopular ? "text-black/80" : "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800")}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <div className={cn("text-4xl font-black mb-6 flex items-baseline tracking-tighter", isPopular ? "text-black" : "text-black dark:text-white")}>
                                        <span>{formatPrice(price)}</span>
                                        <span className={cn("text-base font-bold ml-1", isPopular ? "text-black/60" : "text-neutral-500")}>
                                            /{billingCycle === "monthly" ? "mo" : "yr"}
                                        </span>
                                    </div>
                                    <ul className="space-y-4 text-sm font-bold">
                                        {plan.features.map((feat, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start"
                                            >
                                                <div className={cn("p-0.5 mr-3 border-2", isPopular ? "bg-black border-black text-yellow-300" : "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black")}>
                                                    <Check className="h-3 w-3 stroke-[4px]" />
                                                </div>
                                                <span className={cn("leading-tight", isPopular ? "text-black" : "text-black dark:text-white")}>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <Link href={`/cart?plan=${plan.slug}&billing=${billingCycle}`}>
                                        <Button
                                            className={cn("w-full h-12 text-lg font-black uppercase tracking-wide border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all",
                                                isPopular
                                                    ? "bg-black text-white hover:bg-neutral-800 dark:border-black"
                                                    : "bg-white text-black hover:bg-neutral-50 dark:bg-black dark:text-white dark:border-white dark:hover:bg-neutral-900 dark:shadow-[4px_4px_0px_0px_#ffffff] dark:hover:shadow-[2px_2px_0px_0px_#ffffff]"
                                            )}
                                            variant="default"
                                        >
                                            {t("pricing.choosePlan")}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </ScrollAnimation>
                    );
                })}
            </div>
        </section>
    );
}
