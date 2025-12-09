import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { subscriptionService } from "@/lib/services/subscriptionService";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getTranslations } from "next-intl/server";

export default async function PricingPage() {
    const [plans, t] = await Promise.all([
        subscriptionService.getPlans(),
        getTranslations("Pricing")
    ]);

    return (
        <div className="flex flex-col min-h-screen">
            <section className="container flex flex-col gap-6 py-8 md:max-w-[64rem] md:py-12 lg:py-24 mx-auto">
                <ScrollAnimation>
                    <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem] text-center mb-12">
                        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                            {t("title")}
                        </h2>
                        <p className="max-w-[85%] mx-auto leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                            {t("subtitle")}
                        </p>
                    </div>
                </ScrollAnimation>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan, index) => (
                        <ScrollAnimation key={plan.id} delay={index * 0.1} animation="fade-up" className="h-full">
                            <div className={`flex flex-col gap-4 rounded-lg border p-6 shadow-sm h-full ${plan.slug === 'pro' ? 'border-primary shadow-lg scale-105 bg-background z-10' : 'bg-background/50'}`}>
                                <h3 className="text-2xl font-bold">{plan.name}</h3>
                                <p className="text-muted-foreground">{plan.description}</p>
                                <div className="text-3xl font-bold">
                                    {plan.priceMonthly.toNumber() === 0 ? t("free") : `Rp${plan.priceMonthly.toNumber().toLocaleString()}`}
                                    <span className="text-sm font-normal text-muted-foreground">/{t("month")}</span>
                                </div>
                                <ul className="flex-1 space-y-2 my-4">
                                    {(plan.features as string[]).map((feature) => (
                                        <li key={feature} className="flex items-center text-sm">
                                            <Check className="mr-2 h-4 w-4 text-primary" />
                                            {feature.replace(/_/g, " ")}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={`/register?plan=${plan.slug}`}>
                                    <Button className="w-full" variant={plan.slug === "free" ? "outline" : "default"}>
                                        {t("choose")} {plan.name}
                                    </Button>
                                </Link>
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </section>

            {/* Comparison Table */}
            <section className="container py-12 md:py-24 bg-slate-50 dark:bg-slate-900/20 rounded-3xl mb-12 mx-auto">
                <ScrollAnimation>
                    <h2 className="text-3xl font-bold text-center mb-12">{t("compareTitle")}</h2>
                </ScrollAnimation>
                <ScrollAnimation animation="fade-up" delay={0.2}>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">{t("feature")}</TableHead>
                                    {plans.map((plan) => (
                                        <TableHead key={plan.id} className="text-center font-bold text-lg">{plan.name}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">{t("warehouses")}</TableCell>
                                    <TableCell className="text-center">1</TableCell>
                                    <TableCell className="text-center">5</TableCell>
                                    <TableCell className="text-center">Unlimited</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t("users")}</TableCell>
                                    <TableCell className="text-center">5</TableCell>
                                    <TableCell className="text-center">20</TableCell>
                                    <TableCell className="text-center">Unlimited</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t("apiAccess")}</TableCell>
                                    <TableCell className="text-center"><X className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                                    <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-primary" /></TableCell>
                                    <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-primary" /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t("prioritySupport")}</TableCell>
                                    <TableCell className="text-center"><X className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                                    <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-primary" /></TableCell>
                                    <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-primary" /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t("customIntegrations")}</TableCell>
                                    <TableCell className="text-center"><X className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                                    <TableCell className="text-center"><X className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                                    <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-primary" /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </ScrollAnimation>
            </section>
        </div>
    );
}
