
import { Testimonial, PricingPlan } from "@/types/marketing";

const DUMMY_TESTIMONIALS: Testimonial[] = [
    {
        id: "1",
        name: "Budi Santoso",
        role: "Warehouse Manager",
        content: "Lumbung telah mengubah cara kami mengelola stok. Efisiensi meningkat 200% dalam bulan pertama.",
        avatar: "BS",
    },
    {
        id: "2",
        name: "Sarah Wijaya",
        role: "Business Owner",
        content: "Sistem yang sangat intuitif dan mudah digunakan. Laporan keuangannya sangat membantu pengambilan keputusan.",
        avatar: "SW",
    },
    {
        id: "3",
        name: "Anton Prasetyo",
        role: "Logistics Head",
        content: "Fitur barcode scanning-nya sangat cepat dan akurat. Mengurangi human error secara signifikan.",
        avatar: "AP",
    },
    {
        id: "4",
        name: "Michael Chen",
        role: "Supply Chain Director",
        content: "Inventory accuracy improved by 99% within the first month. Incredible tool.",
        avatar: "MC",
    },
    {
        id: "5",
        name: "Jessica Fox",
        role: "Logistics Manager",
        content: "The best warehouse management system we have used in years.",
        avatar: "JF",
    },
    {
        id: "6",
        name: "Rina Kartika",
        role: "Operational Manager",
        content: "Sangat membantu dalam tracking expired date barang. Highly recommended!",
        avatar: "RK",
    },
    {
        id: "7",
        name: "David Tan",
        role: "Retail Owner",
        content: "Integrasi dengan POS sangat mulus. Stok selalu sinkron real-time.",
        avatar: "DT",
    },
    {
        id: "8",
        name: "Amanda Lee",
        role: "Procurement Lead",
        content: "Fitur purchase order otomatis sangat menghemat waktu tim kami.",
        avatar: "AL",
    },
    {
        id: "9",
        name: "Reza Pratama",
        role: "IT Manager",
        content: "API-nya sangat well-documented dan mudah diintegrasikan dengan sistem internal kami.",
        avatar: "RP",
    },
    {
        id: "10",
        name: "Siti Nurhaliza",
        role: "Small Business Owner",
        content: "Harga sangat terjangkau untuk fitur selengkap ini. Support timnya juga ramah.",
        avatar: "SN",
    },
];

const DUMMY_PLANS: PricingPlan[] = [
    {
        id: "plan_free",
        name: "Free",
        slug: "free",
        description: "For individuals exploring the system.",
        priceMonthly: 0,
        priceYearly: 0,
        features: [
            "Up to 50 Items",
            "1 Warehouse",
            "Community Support",
            "Basic Dashboard"
        ],
        limits: { maxItems: 50, maxWarehouses: 1, maxUsers: 1 }
    },
    {
        id: "plan_starter",
        name: "Starter",
        slug: "starter",
        description: "Perfect for small businesses just getting started.",
        priceMonthly: 290000,
        priceYearly: 2900000, // 2 months free
        features: [
            "Up to 1,000 Items",
            "1 Warehouse",
            "Basic Reporting",
            "Email Support"
        ],
        limits: { maxItems: 1000, maxWarehouses: 1, maxUsers: 5 }
    },
    {
        id: "plan_pro",
        name: "Pro",
        slug: "pro",
        description: "For growing businesses needing advanced features.",
        priceMonthly: 790000,
        priceYearly: 7900000, // 2 months free
        features: [
            "Unlimited Items",
            "Up to 5 Warehouses",
            "Advanced Analytics",
            "Priority Support",
            "API Access"
        ],
        limits: { maxItems: -1, maxWarehouses: 5, maxUsers: 20 },
        popular: true
    },
    {
        id: "plan_enterprise",
        name: "Enterprise",
        slug: "enterprise",
        description: "Custom solutions for large-scale operations.",
        priceMonthly: 1990000,
        priceYearly: 19900000, // 2 months free
        features: [
            "Unlimited Everything",
            "Custom Integrations",
            "Dedicated Account Manager",
            "SLA Support",
            "On-premise Deployment Option"
        ],
        limits: { maxItems: -1, maxWarehouses: -1, maxUsers: -1 }
    }
];

export async function getTestimonials(): Promise<Testimonial[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/marketing/testimonials`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.warn("Failed to fetch testimonials from backend, falling back to dummy data.");
            return DUMMY_TESTIMONIALS;
        }

        const data = await res.json();

        if (!data || data.length === 0) {
            return DUMMY_TESTIMONIALS;
        }

        return data;
    } catch (error) {
        console.warn("Error fetching testimonials, falling back to dummy data:", error);
        return DUMMY_TESTIMONIALS;
    }
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
    try {
        // Backend exposes /api/marketing/plans via marketingRoutes
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/marketing/plans`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.warn("Failed to fetch plans from backend, falling back to dummy data.");
            return DUMMY_PLANS;
        }

        const data = await res.json();
        if (!data || data.length === 0) {
            return DUMMY_PLANS;
        }

        // Transform backend response to match PricingPlan interface
        // Backend returns Decimal as string, so we parse to number
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const plans: PricingPlan[] = data.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            slug: plan.slug,
            description: plan.description || '',
            priceMonthly: parseFloat(plan.priceMonthly) || 0,
            priceYearly: parseFloat(plan.priceYearly) || 0,
            features: Array.isArray(plan.features) ? plan.features : [],
            popular: plan.slug === 'pro', // Mark Pro as popular
            limits: plan.limits,
        }));

        return plans;

    } catch (error) {
        console.warn("Error fetching plans, falling back to dummy data:", error);
        return DUMMY_PLANS;
    }
}
