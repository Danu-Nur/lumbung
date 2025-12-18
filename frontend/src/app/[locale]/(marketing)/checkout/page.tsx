"use client";

import { useSearchParams } from "next/navigation";
import { Copy, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { useEffect, useState } from "react";
import { getPricingPlans } from "@/services/marketingService";
import { PricingPlan } from "@/types/marketing";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const planSlug = searchParams.get("plan") || "starter";
    const billingCycle = searchParams.get("billing") || "monthly";

    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            const data = await getPricingPlans();
            setPlans(data);
            const plan = data.find(p => p.slug === planSlug);
            setSelectedPlan(plan || data[0]);
        };
        fetchPlans();
    }, [planSlug]);

    if (!selectedPlan) return <div className="min-h-screen bg-white dark:bg-black" />;

    const price = billingCycle === "yearly" ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
    const cycleLabel = billingCycle === "yearly" ? "/year" : "/month";

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-12 md:py-24 font-sans">
            <div className="container mx-auto px-4 max-w-6xl">
                <ScrollAnimation>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-center text-black dark:text-white">
                        Secure Checkout
                    </h1>
                </ScrollAnimation>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* LEFT COLUMN: Payment Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_white]">
                            <div className="flex items-center gap-3 mb-6 border-b-4 border-black dark:border-white pb-4">
                                <div className="bg-yellow-300 dark:bg-yellow-500 p-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_white]">
                                    <CreditCard className="w-6 h-6 text-black" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">Payment Method</h2>
                            </div>

                            <form className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="font-bold uppercase">Cardholder Name</Label>
                                    <Input id="name" placeholder="JOHN DOE" className="border-2 border-black dark:border-white rounded-none h-12 font-bold uppercase" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="card" className="font-bold uppercase">Card Number</Label>
                                    <Input id="card" placeholder="0000 0000 0000 0000" className="border-2 border-black dark:border-white rounded-none h-12 font-mono font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="expiry" className="font-bold uppercase">Expiry (MM/YY)</Label>
                                        <Input id="expiry" placeholder="12/25" className="border-2 border-black dark:border-white rounded-none h-12 font-mono font-bold" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cvc" className="font-bold uppercase">CVC</Label>
                                        <Input id="cvc" placeholder="123" className="border-2 border-black dark:border-white rounded-none h-12 font-mono font-bold" />
                                    </div>
                                </div>

                                <Button className="w-full h-14 mt-4 text-xl font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 border-2 border-transparent rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                                    Pay {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)}
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 mt-4 uppercase tracking-wide">
                                    <Lock className="w-3 h-3" />
                                    Encrypted & Secure Payment
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-yellow-300 dark:bg-yellow-600 border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_white] sticky top-24">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white pb-2 flex items-center gap-2">
                                <Copy className="w-5 h-5" /> Order Summary
                            </h3>

                            <div className="mb-6">
                                <div className="text-sm font-bold opacity-80 uppercase mb-1">Plan</div>
                                <div className="text-3xl font-black uppercase tracking-tighter">{selectedPlan.name}</div>
                            </div>

                            <div className="mb-6">
                                <div className="text-sm font-bold opacity-80 uppercase mb-1">Billing Cycle</div>
                                <div className="text-xl font-bold uppercase bg-white dark:bg-black text-black dark:text-white inline-block px-2 py-1 border-2 border-black dark:border-white">
                                    {billingCycle}
                                </div>
                            </div>

                            <div className="border-t-2 border-black dark:border-white pt-4 mt-4">
                                <div className="flex justify-between items-end">
                                    <span className="font-black text-lg uppercase">Total</span>
                                    <span className="font-black text-3xl tracking-tighter">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)}
                                        <span className="text-sm font-bold opacity-70">{cycleLabel}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 flex items-start gap-3 text-sm font-bold">
                                <ShieldCheck className="w-5 h-5 shrink-0" />
                                <p className="leading-tight">
                                    30-day money-back guarantee. No questions asked.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
