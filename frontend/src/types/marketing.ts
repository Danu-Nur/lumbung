
export interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar?: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    slug: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    features: string[];
    popular?: boolean;
    limits?: {
        maxUsers?: number;
        maxWarehouses?: number;
        maxItems?: number;
    };
}
