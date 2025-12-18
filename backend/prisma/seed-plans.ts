import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Plans
    const plans = [
        {
            name: 'Free',
            slug: 'free',
            description: 'Perfect for getting started',
            priceMonthly: 0,
            priceYearly: 0,
            limits: {
                maxUsers: 2,
                maxWarehouses: 1,
                maxItems: 100
            },
            features: ['Basic inventory tracking', 'Up to 100 products', '1 warehouse', '2 users']
        },
        {
            name: 'Basic',
            slug: 'basic',
            description: 'For small businesses',
            priceMonthly: 99000,
            priceYearly: 990000,
            limits: {
                maxUsers: 5,
                maxWarehouses: 3,
                maxItems: 1000
            },
            features: ['Advanced inventory', 'Up to 1,000 products', '3 warehouses', '5 users', 'Email support']
        },
        {
            name: 'Pro',
            slug: 'pro',
            description: 'For growing businesses',
            priceMonthly: 299000,
            priceYearly: 2990000,
            limits: {
                maxUsers: 20,
                maxWarehouses: 10,
                maxItems: 10000
            },
            features: ['Everything in Basic', 'Up to 10,000 products', '10 warehouses', '20 users', 'Priority support', 'Advanced reports', 'API access']
        },
        {
            name: 'Enterprise',
            slug: 'enterprise',
            description: 'For large organizations',
            priceMonthly: 999000,
            priceYearly: 9990000,
            limits: {
                maxUsers: -1,
                maxWarehouses: -1,
                maxItems: -1
            },
            features: ['Everything in Pro', 'Unlimited products', 'Unlimited warehouses', 'Unlimited users', 'Dedicated support', 'Custom integrations', 'SLA guarantee']
        }
    ];

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { slug: plan.slug },
            update: plan,
            create: plan
        });
        console.log(`✅ Created/Updated plan: ${plan.name}`);
    }

    console.log('✨ Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
