import { auth } from "@/lib/auth";
import { subscriptionService, PlanLimits } from "@/lib/services/subscriptionService";
import { redirect } from "next/navigation";

export async function checkSubscriptionLimit(limitKey: keyof PlanLimits, currentCount: number) {
    const session = await auth();
    if (!session?.user?.organizationId) return;

    const { allowed, limit } = await subscriptionService.checkLimit(
        session.user.organizationId,
        limitKey,
        currentCount
    );

    if (!allowed) {
        throw new Error(`Plan limit reached: ${limitKey} (Max: ${limit})`);
        // Or redirect to upgrade page
        // redirect("/settings/billing?error=limit_reached");
    }
}

export async function getSubscriptionLimits() {
    const session = await auth();
    if (!session?.user?.organizationId) return null;

    const sub = await subscriptionService.getSubscription(session.user.organizationId);
    return sub.plan.limits as PlanLimits;
}
