import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { subscriptionService } from "@/lib/services/subscriptionService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function BillingPage() {
    const session = await auth();
    const organizationId = session?.user?.organizationId;

    if (!organizationId) {
        redirect({ href: "/login", locale: "id" });
        return null; // Satisfy TS if redirect doesn't return never
    }

    const t = await getTranslations("Settings");
    const subscription = await subscriptionService.getSubscription(organizationId);
    const plans = await subscriptionService.getPlans();

    const isPro = subscription.plan.slug === "pro";
    const isFree = subscription.plan.slug === "free";

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Subscription & Billing</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your organization's plan and billing details.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>
                            You are currently on the <span className="font-semibold">{subscription.plan.name}</span> plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-primary/10 p-2">
                                    {isPro ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                                </div>
                                <div>
                                    <h4 className="font-semibold">{subscription.plan.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {isFree ? "Basic features for small teams" : "Advanced features for growing businesses"}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={subscription.status === "ACTIVE" ? "default" : "destructive"}>
                                {subscription.status}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium">Plan Limits</div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Users:</span>{" "}
                                    {(subscription.plan.limits as any).maxUsers}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Warehouses:</span>{" "}
                                    {(subscription.plan.limits as any).maxWarehouses}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upgrade Plan</CardTitle>
                        <CardDescription>Unlock more features and higher limits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {plans.map(plan => {
                            if (plan.id === subscription.planId) return null;
                            return (
                                <div key={plan.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <h4 className="font-semibold">{plan.name}</h4>
                                        <p className="text-sm text-muted-foreground">Rp{plan.priceMonthly.toNumber().toLocaleString()}/mo</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Switch to {plan.name}
                                    </Button>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
