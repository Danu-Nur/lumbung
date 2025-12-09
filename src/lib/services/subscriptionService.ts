import { prisma } from "@/lib/prisma";
import { Plan, Subscription, SubscriptionStatus } from "@prisma/client";
import { getCache } from "@/lib/performance/cache";

const CACHE_TTL = 3600; // 1 hour

export type PlanLimits = {
    maxUsers: number;
    maxWarehouses: number;
    maxItems: number;
};

export class SubscriptionService {
    private cache = getCache();

    /**
     * Get the active subscription for an organization.
     * Caches the result.
     */
    async getSubscription(organizationId: string): Promise<Subscription & { plan: Plan }> {
        const cacheKey = `subscription:${organizationId}`;
        const cached = await this.cache.get<Subscription & { plan: Plan }>(cacheKey);

        if (cached) return cached;

        const subscription = await prisma.subscription.findUnique({
            where: { organizationId },
            include: { plan: true },
        });

        if (!subscription) {
            // Fallback to Free plan if no subscription found (should ideally not happen if seeded correctly)
            const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
            if (!freePlan) throw new Error("Default plan not found");

            // Create a default subscription
            const newSub = await prisma.subscription.create({
                data: {
                    organizationId,
                    planId: freePlan.id,
                    status: "ACTIVE",
                },
                include: { plan: true },
            });

            await this.cache.set(cacheKey, newSub, CACHE_TTL);
            return newSub;
        }

        await this.cache.set(cacheKey, subscription, CACHE_TTL);
        return subscription;
    }

    /**
     * Check if an organization has reached a specific limit.
     */
    async checkLimit(
        organizationId: string,
        limitKey: keyof PlanLimits,
        currentCount: number
    ): Promise<{ allowed: boolean; limit: number }> {
        const subscription = await this.getSubscription(organizationId);
        const limits = subscription.plan.limits as PlanLimits;
        const limit = limits[limitKey] || 0;

        // If limit is -1 or 0 (depending on convention), it might mean unlimited. 
        // Let's assume -1 is unlimited.
        if (limit === -1) return { allowed: true, limit };

        return { allowed: currentCount < limit, limit };
    }

    /**
     * Get all available plans.
     */
    async getPlans(): Promise<Plan[]> {
        return prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { priceMonthly: "asc" },
        });
    }

    /**
     * Upgrade or downgrade an organization's plan.
     * This is a simplified version. In a real app, this would involve payment processing.
     */
    async changePlan(organizationId: string, planSlug: string): Promise<Subscription> {
        const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
        if (!plan) throw new Error("Plan not found");

        const subscription = await prisma.subscription.update({
            where: { organizationId },
            data: {
                planId: plan.id,
                status: "ACTIVE", // Assume immediate activation for now
                updatedAt: new Date(),
            },
            include: { plan: true },
        });

        // Invalidate cache
        await this.cache.delete(`subscription:${organizationId}`);

        return subscription;
    }
}

export const subscriptionService = new SubscriptionService();
