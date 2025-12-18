"use client";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { getPricingPlans } from "@/services/marketingService";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PricingPlan } from "@/types/marketing";

export default function PricingPage() {
    const t = useTranslations("Pricing");
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <div className="min-h-screen"></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-300">
            {/* Hero Section */}
            <header className="container mx-auto px-4 py-20 relative bg-[#FFD700] dark:bg-yellow-600 border-b-4 border-black dark:border-white transition-colors duration-300">
                <div className="absolute inset-0 bg-[url('/dots.svg')] opacity-20" />
                <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem] text-center mb-12 relative z-10">
                    <ScrollAnimation>
                        <div className="inline-block bg-white dark:bg-black border-2 border-black dark:border-white px-3 py-1 font-bold mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] transform -rotate-2 text-black dark:text-white">
                            PRICING PLANS
                        </div>
                        <h2 className="font-black text-4xl leading-[1.1] sm:text-4xl md:text-6xl text-black dark:text-white uppercase">
                            {t("title")}
                        </h2>
                        <p className="max-w-[85%] mx-auto leading-normal text-xl font-bold bg-white dark:bg-black border-2 border-black dark:border-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] text-black dark:text-gray-200 mt-6">
                            {t("subtitle")}
                        </p>
                    </ScrollAnimation>
                </div>
            </header>

            <section className="container flex flex-col gap-6 py-8 md:max-w-[84rem] md:py-12 lg:py-24 mx-auto">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {plans.map((plan, index) => (
                        <ScrollAnimation key={plan.id} delay={index * 0.1} animation="fade-up" className="h-full">
                            <div className={`flex flex-col gap-4 rounded-none border-2 border-black dark:border-white p-6 h-full transition-all ${plan.slug === 'pro'
                                ? 'bg-yellow-300 dark:bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] -translate-y-2 z-10'
                                : 'bg-white dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] hover:-translate-y-1'
                                }`}>
                                <div className="space-y-2">
                                    <h3 className={`text-2xl font-black uppercase ${plan.slug === 'pro' ? 'text-black' : 'text-black dark:text-white'}`}>{plan.name}</h3>
                                    <div className="w-12 h-1 bg-black dark:bg-white"></div>
                                </div>
                                <p className={`font-medium ${plan.slug === 'pro' ? 'text-black/80' : 'text-neutral-600 dark:text-neutral-400'}`}>{plan.description}</p>
                                <div className={`text-3xl font-black ${plan.slug === 'pro' ? 'text-black' : 'text-black dark:text-white'}`}>
                                    {plan.priceMonthly === 0 ? t("free") : formatPrice(plan.priceMonthly)}
                                    <span className={`text-base font-bold ml-1 ${plan.slug === 'pro' ? 'text-black/60' : 'text-neutral-500 dark:text-neutral-500'}`}>/{t("month")}</span>
                                </div>
                                <ul className="flex-1 space-y-3 my-6">
                                    {plan.features.map((feature: string) => (
                                        <li key={feature} className="flex items-start text-sm font-bold">
                                            <Check className={`mr-2 h-5 w-5 shrink-0 ${plan.slug === 'pro' ? 'text-black' : 'text-black dark:text-white'}`} />
                                            <span className={plan.slug === 'pro' ? 'text-black' : 'text-neutral-800 dark:text-neutral-200'}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href={`/register?plan=${plan.slug}`}>
                                    <Button
                                        variant={plan.slug === 'pro' ? 'outline' : 'default'}
                                    >
                                        {t("choose")} {plan.name}
                                    </Button>
                                </Link>
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </section>

            {/* Comparison Table */}
            <section className="container py-12 md:py-24 mx-auto mb-20">
                <ScrollAnimation>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black uppercase tracking-tight bg-white dark:bg-black border-2 border-black dark:border-white inline-block px-8 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] text-black dark:text-white transform rotate-1">
                            {t("compareTitle")}
                        </h2>
                    </div>
                </ScrollAnimation>
                <ScrollAnimation animation="fade-up" delay={0.2}>
                    <div className="overflow-x-auto border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] bg-white dark:bg-neutral-900 p-4">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-4 border-black dark:border-white hover:bg-transparent">
                                    <TableHead className="w-[300px] text-black dark:text-white font-black text-xl uppercase tracking-tighter align-bottom pb-4">{t("feature")}</TableHead>
                                    {plans.map((plan) => (
                                        <TableHead key={plan.id} className="text-center text-black dark:text-white font-black text-xl uppercase tracking-tighter align-bottom pb-4">
                                            <div className="inline-block border-b-4 border-transparent hover:border-yellow-400 transition-colors pb-1">
                                                {plan.name}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-b-2 border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    <TableCell className="font-bold text-black dark:text-white py-4 text-base">{t("warehouses")}</TableCell>
                                    {plans.map(plan => (
                                        <TableCell key={plan.id} className="text-center font-mono font-bold text-neutral-700 dark:text-neutral-300 py-4 text-base">
                                            {plan.limits?.maxWarehouses === -1 ? "Unlimited" : (plan.limits?.maxWarehouses || "-")}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="border-b-2 border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    <TableCell className="font-bold text-black dark:text-white py-4 text-base">{t("users")}</TableCell>
                                    {plans.map(plan => (
                                        <TableCell key={plan.id} className="text-center font-mono font-bold text-neutral-700 dark:text-neutral-300 py-4 text-base">
                                            {plan.limits?.maxUsers === -1 ? "Unlimited" : (plan.limits?.maxUsers || "-")}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="border-b-2 border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    <TableCell className="font-bold text-black dark:text-white py-4 text-base">{t("apiAccess")}</TableCell>
                                    {plans.map(plan => {
                                        const hasApi = plan.features.some(f => f.toLowerCase().includes("api"));
                                        return (
                                            <TableCell key={plan.id} className="text-center py-4">
                                                {hasApi ? <div className="mx-auto w-8 h-8 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-none shadow-sm"><Check className="h-5 w-5 stroke-[4px]" /></div> : <div className="mx-auto w-8 h-8 flex items-center justify-center border-2 border-neutral-300 dark:border-neutral-700"><X className="h-5 w-5 text-neutral-300 dark:text-neutral-700" /></div>}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                                <TableRow className="border-b-2 border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    <TableCell className="font-bold text-black dark:text-white py-4 text-base">{t("prioritySupport")}</TableCell>
                                    {plans.map(plan => {
                                        const hasSupport = plan.features.some(f => f.toLowerCase().includes("priority support") || f.toLowerCase().includes("sla"));
                                        return (
                                            <TableCell key={plan.id} className="text-center py-4">
                                                {hasSupport ? <div className="mx-auto w-8 h-8 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-none shadow-sm"><Check className="h-5 w-5 stroke-[4px]" /></div> : <div className="mx-auto w-8 h-8 flex items-center justify-center border-2 border-neutral-300 dark:border-neutral-700"><X className="h-5 w-5 text-neutral-300 dark:text-neutral-700" /></div>}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                                <TableRow className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    <TableCell className="font-bold text-black dark:text-white py-4 text-base">{t("customIntegrations")}</TableCell>
                                    {plans.map(plan => {
                                        const hasCustom = plan.features.some(f => f.toLowerCase().includes("custom"));
                                        return (
                                            <TableCell key={plan.id} className="text-center py-4">
                                                {hasCustom ? <div className="mx-auto w-8 h-8 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-none shadow-sm"><Check className="h-5 w-5 stroke-[4px]" /></div> : <div className="mx-auto w-8 h-8 flex items-center justify-center border-2 border-neutral-300 dark:border-neutral-700"><X className="h-5 w-5 text-neutral-300 dark:text-neutral-700" /></div>}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </ScrollAnimation>
            </section>
        </div>
    );
}
