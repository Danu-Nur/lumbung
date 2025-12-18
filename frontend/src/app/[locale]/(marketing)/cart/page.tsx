"use client";

import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Copy, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { useEffect, useState } from "react";
import { getPricingPlans } from "@/services/marketingService";
import { PricingPlan } from "@/types/marketing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Mock Auth Check - In reality, use your AuthContext / Session
const useAuth = () => {
    // For now, simple check. Replace with logic to check if user is logged in
    return { isAuthenticated: false };
}

export default function CartPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialPlanSlug = searchParams.get("plan");
    const initialBilling = searchParams.get("billing") as "monthly" | "yearly" || "monthly";

    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>(initialPlanSlug || "");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(initialBilling);
    const [loading, setLoading] = useState(true);

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchPlans = async () => {
            const data = await getPricingPlans();
            setPlans(data);
            if (!initialPlanSlug && data.length > 0) {
                setSelectedPlanSlug(data[0].slug);
            } else if (initialPlanSlug) {
                setSelectedPlanSlug(initialPlanSlug);
            }
            setLoading(false);
        };
        fetchPlans();
    }, [initialPlanSlug]);

    if (loading) return <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900" />;

    const selectedPlan = plans.find(p => p.slug === selectedPlanSlug);

    if (!selectedPlan) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <div className="text-center">
                    <h1 className="text-2xl font-black mb-4">Plan not found</h1>
                    <Link href="/pricing"><Button>Back to Pricing</Button></Link>
                </div>
            </div>
        )
    }

    const price = billingCycle === "yearly" ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
    const cycleLabel = billingCycle === "yearly" ? "/year" : "/month";
    const isFree = price === 0;

    const handleCheckout = () => {
        // Logic for redirection
        const targetUrl = isFree ? `/register?plan=${selectedPlanSlug}` : `/checkout?plan=${selectedPlanSlug}&billing=${billingCycle}`;

        if (isAuthenticated) {
            if (isFree) {
                // If logged in & free -> Dashboard
                router.push("/dashboard");
            } else {
                // If logged in & paid -> Checkout
                router.push(targetUrl);
            }
        } else {
            // If NOT logged in
            if (isFree) {
                // Free -> Register
                router.push(targetUrl);
            } else {
                // Paid -> Login (then redirect to checkout)
                // Simple trick: pass the checkout URL as callback
                // Adjust based on your Auth provider logic
                router.push(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-12 md:py-24 font-sans">
            <div className="container mx-auto px-4 max-w-5xl">
                <ScrollAnimation>
                    <div className="flex items-center gap-4 mb-8 border-b-4 border-black dark:border-white pb-6">
                        <div className="bg-yellow-300 dark:bg-yellow-500 p-3 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white]">
                            <ShoppingCart className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">
                            Your Cart
                        </h1>
                    </div>
                </ScrollAnimation>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* LEFT COLUMN: Cart Items */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_white]">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black uppercase mb-2">Subscription Context</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400 font-bold">Manage your plan selection</p>
                                </div>
                            </div>

                            <div className="border-2 border-black dark:border-white p-4 bg-neutral-50 dark:bg-neutral-900 mb-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="font-black uppercase">Plan Selection</Label>
                                        <Select
                                            value={selectedPlanSlug}
                                            onValueChange={(val) => setSelectedPlanSlug(val)}
                                        >
                                            <SelectTrigger className="border-2 border-black dark:border-white rounded-none font-bold h-12 box-border">
                                                <SelectValue placeholder="Select a plan" />
                                            </SelectTrigger>
                                            <SelectContent className="border-2 border-black dark:border-white rounded-none">
                                                {plans.map(p => (
                                                    <SelectItem key={p.slug} value={p.slug} className="font-bold focus:bg-yellow-300 focus:text-black rounded-none cursor-pointer">
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-black uppercase">Billing Cycle</Label>
                                        <div className="flex items-center h-12 border-2 border-black dark:border-white bg-white dark:bg-black px-4 gap-4">
                                            <span className={`font-bold uppercase text-sm ${billingCycle === 'monthly' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>Monthly</span>
                                            <Switch
                                                checked={billingCycle === "yearly"}
                                                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
                                                className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
                                            />
                                            <span className={`font-bold uppercase text-sm ${billingCycle === 'yearly' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>Yearly</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-yellow-300 dark:bg-yellow-600 border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_white] sticky top-24">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white pb-2 flex items-center gap-2">
                                <Copy className="w-5 h-5" /> Summary
                            </h3>

                            <div className="mb-6 space-y-4">
                                <div className="flex justify-between items-center border-b-2 border-black/10 dark:border-white/10 pb-2">
                                    <span className="font-bold uppercase opacity-80">{selectedPlan.name} Plan</span>
                                    <span className="font-black">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2">
                                    <span className="font-bold uppercase opacity-80">Billing</span>
                                    <span className="font-black uppercase bg-white dark:bg-black text-black dark:text-white px-2 py-0.5 text-sm border border-black dark:border-white">{billingCycle}</span>
                                </div>
                            </div>

                            <div className="border-t-2 border-black dark:border-white pt-4 mt-4 mb-6">
                                <div className="flex justify-between items-end">
                                    <span className="font-black text-lg uppercase">Total</span>
                                    <span className="font-black text-3xl tracking-tighter">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)}
                                        <span className="text-sm font-bold opacity-70 ml-1">{cycleLabel}</span>
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                className="w-full h-14 text-xl font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 border-2 border-transparent rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                            >
                                {isFree ? "Get Started" : "Checkout"} <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
