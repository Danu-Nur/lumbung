import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingPartners } from "@/components/marketing/marketing-partners";
import { MarketingFeatures } from "@/components/marketing/marketing-features";
import { MarketingMetrics } from "@/components/marketing/marketing-metrics";
import { MarketingTestimonials } from "@/components/marketing/marketing-testimonials";
import { MarketingPricing } from "@/components/marketing/marketing-pricing";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-cta";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                {/* HERO SECTION */}
                <HeroSection />

                {/* PARTNERS / SOCIAL PROOF */}
                <ScrollAnimation animation="fade-in" delay={0.2}>
                    <MarketingPartners />
                </ScrollAnimation>

                {/* FEATURES SECTION (BENTO GRID) */}
                <MarketingFeatures />

                {/* METRICS SECTION */}
                <MarketingMetrics />

                {/* TESTIMONIALS SECTION */}
                <MarketingTestimonials />

                {/* PRICING SECTION */}
                <MarketingPricing />

                {/* FAQ SECTION */}
                <MarketingFaq />

                {/* CTA BOTTOM */}
                <MarketingCta />
            </main>
        </div>
    );
}
