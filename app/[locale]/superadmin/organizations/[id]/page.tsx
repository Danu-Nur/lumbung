import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { subscriptionService } from "@/lib/services/subscriptionService";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
            subscription: { include: { plan: true } },
            users: true,
            warehouses: true,
        },
    });

    if (!organization) notFound();

    const plans = await subscriptionService.getPlans();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{organization.name}</h1>
                    <p className="text-muted-foreground">Slug: {organization.slug} | ID: {organization.id}</p>
                </div>
                <Badge variant={organization.subscription?.status === "ACTIVE" ? "default" : "destructive"}>
                    {organization.subscription?.status || "NO SUBSCRIPTION"}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <span className="font-medium">Plan:</span>
                            <span>{organization.subscription?.plan.name || "None"}</span>

                            <span className="font-medium">Status:</span>
                            <span>{organization.subscription?.status || "-"}</span>

                            <span className="font-medium">Start Date:</span>
                            <span>{organization.subscription?.startDate.toLocaleDateString() || "-"}</span>

                            <span className="font-medium">End Date:</span>
                            <span>{organization.subscription?.endDate?.toLocaleDateString() || "Auto-renew"}</span>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-medium">Change Plan (Admin Action)</h4>
                            <div className="flex flex-wrap gap-2">
                                {plans.map(plan => (
                                    <form key={plan.id} action={async () => {
                                        "use server";
                                        // This would ideally be a proper server action in a separate file
                                        // For MVP we can use inline server action if configured, but better to keep clean.
                                        // We'll just show buttons for now.
                                    }}>
                                        <Button variant="outline" size="sm" disabled={organization.subscription?.planId === plan.id}>
                                            Set to {plan.name}
                                        </Button>
                                    </form>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Usage Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <span className="font-medium">Users:</span>
                            <span>{organization.users.length}</span>

                            <span className="font-medium">Warehouses:</span>
                            <span>{organization.warehouses.length}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
