import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
    ArrowRight,
    CheckCircle2,
    Quote
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeroSection } from "@/components/marketing/hero-section";
import { BentoGrid } from "@/components/marketing/bento-grid";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export default function LandingPage() {
    const t = useTranslations("Landing");

    // Data Testimonials
    const testimonials = [
        {
            name: t("testimonials.budi.name"),
            role: t("testimonials.budi.role"),
            content: t("testimonials.budi.content"),
            avatar: "BS",
        },
        {
            name: t("testimonials.sarah.name"),
            role: t("testimonials.sarah.role"),
            content: t("testimonials.sarah.content"),
            avatar: "SW",
        },
        {
            name: t("testimonials.anton.name"),
            role: t("testimonials.anton.role"),
            content: t("testimonials.anton.content"),
            avatar: "AP",
        },
    ];

    // Data Pricing
    const pricingPlans = [
        {
            name: t("pricing.starter.name"),
            price: t("pricing.starter.price"),
            description: t("pricing.starter.description"),
            features: [
                t("pricing.starter.features.0"),
                t("pricing.starter.features.1"),
                t("pricing.starter.features.2"),
            ],
        },
        {
            name: t("pricing.pro.name"),
            price: t("pricing.pro.price"),
            description: t("pricing.pro.description"),
            features: [
                t("pricing.pro.features.0"),
                t("pricing.pro.features.1"),
                t("pricing.pro.features.2"),
                t("pricing.pro.features.3"),
            ],
            popular: true,
        },
        {
            name: t("pricing.enterprise.name"),
            price: t("pricing.enterprise.price"),
            description: t("pricing.enterprise.description"),
            features: [
                t("pricing.enterprise.features.0"),
                t("pricing.enterprise.features.1"),
                t("pricing.enterprise.features.2"),
            ],
        },
    ];

    // Data FAQ
    const faqs = [
        {
            question: t("faq.multiWarehouse.question"),
            answer: t("faq.multiWarehouse.answer"),
        },
        {
            question: t("faq.trial.question"),
            answer: t("faq.trial.answer"),
        },
        {
            question: t("faq.export.question"),
            answer: t("faq.export.answer"),
        },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* HERO SECTION */}

            <main className="flex-1">
                <HeroSection />
                {/* --- PARTNERS / SOCIAL PROOF --- */}
                <ScrollAnimation animation="fade-in" delay={0.2}>
                    <section
                        id="partners"
                        className="container py-8 md:py-12 mx-auto"
                    >
                        <div className="text-center text-sm font-medium text-muted-foreground mb-6">
                            {t("partners.trustedBy")}
                        </div>
                        <div className="mx-auto grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 opacity-50 grayscale hover:opacity-100 transition-opacity">
                            {/* Placeholder Logos */}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-center font-semibold text-base md:text-lg"
                                >
                                    {t("partners.logo")} {i + 1}
                                </div>
                            ))}
                        </div>
                    </section>
                </ScrollAnimation>

                {/* --- FEATURES SECTION (BENTO GRID) --- */}
                <section
                    id="features"
                    className="relative container mx-auto space-y-12 py-12 md:py-24 lg:py-32"
                >
                    {/* 1. Background Pattern Halus (Titik-titik) biar tidak sepi */}
                    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-black dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>

                    <ScrollAnimation>
                        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
                            {/* Badge Kecil di atas Judul */}
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none text-muted-foreground bg-muted/50">
                                ✨ Features
                            </div>

                            <h2 className="font-heading text-3xl font-bold leading-[1.1] tracking-tight sm:text-3xl md:text-5xl lg:text-6xl">
                                {t("features.title")}
                            </h2>
                            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                                {t("features.subtitle")}
                            </p>
                        </div>
                    </ScrollAnimation>

                    {/* BentoGrid tetap di sini */}
                    <div className="py-4">
                        <BentoGrid />
                    </div>

                    {/* 2. Metrics (Angka) dengan tampilan Card/Panel yang menyatu */}
                    <ScrollAnimation animation="fade-up" delay={0.1}>
                        <div className="mt-12 mx-auto max-w-5xl rounded-2xl border bg-background/60 backdrop-blur-sm p-8 shadow-sm">
                            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-4 sm:divide-x dark:divide-gray-800">

                                {/* Metric 1 */}
                                <div className="flex flex-col items-center justify-center space-y-2 p-2">
                                    <p className="text-4xl font-extrabold tracking-tight text-foreground">
                                        {t("metrics.itemsTracked")}
                                    </p>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                                        {t("metrics.itemsTrackedLabel")}
                                    </p>
                                </div>

                                {/* Metric 2 */}
                                <div className="flex flex-col items-center justify-center space-y-2 p-2">
                                    <p className="text-4xl font-extrabold tracking-tight text-foreground">
                                        {t("metrics.timeSaved")}
                                    </p>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                                        {t("metrics.timeSavedLabel")}
                                    </p>
                                </div>

                                {/* Metric 3 */}
                                <div className="flex flex-col items-center justify-center space-y-2 p-2">
                                    <p className="text-4xl font-extrabold tracking-tight text-foreground">
                                        {t("metrics.errorReduced")}
                                    </p>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                                        {t("metrics.errorReducedLabel")}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </ScrollAnimation>
                </section>

                {/* --- TESTIMONIALS SECTION --- */}
                <section
                    id="testimonials"
                    className="container py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/20 rounded-3xl mx-auto"
                >
                    <ScrollAnimation>
                        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                            <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                                {t("testimonials.title")}
                            </h2>
                            <p className="text-muted-foreground max-w-[42rem]">
                                {t("testimonials.subtitle")}
                            </p>
                        </div>
                    </ScrollAnimation>

                    <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-12">
                        {testimonials.map((item, index) => (
                            <ScrollAnimation
                                key={index}
                                delay={index * 0.1}
                                animation="scale-up"
                            >
                                <Card className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <Quote className="h-8 w-8 text-primary/20 mb-2" />
                                        <CardDescription className="text-base text-foreground font-medium italic">
                                            “{item.content}”
                                        </CardDescription>
                                    </CardHeader>
                                    <CardFooter className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage />
                                            <AvatarFallback>{item.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold leading-none">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.role}
                                            </p>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </ScrollAnimation>
                        ))}
                    </div>
                </section>

                {/* --- PRICING SECTION --- */}
                <section
                    id="pricing"
                    className="container py-12 md:py-24 lg:py-32 mx-auto"
                >
                    <ScrollAnimation>
                        <div className="mx-auto flex max-w-2xl flex-col items-center space-y-4 text-center mb-10">
                            <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                                {t("pricing.title")}
                            </h2>
                            <p className="text-muted-foreground sm:text-lg">
                                {t("pricing.subtitle")}
                            </p>
                        </div>
                    </ScrollAnimation>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 max-w-6xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <ScrollAnimation
                                key={plan.name}
                                delay={index * 0.1}
                                animation="fade-up"
                                className="h-full"
                            >
                                <Card
                                    className={`flex flex-col h-full ${(plan as any).popular
                                        ? "border-primary shadow-lg relative scale-105 z-10"
                                        : ""
                                        }`}
                                >
                                    {(plan as any).popular && (
                                        <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                            <Badge className="bg-primary text-primary-foreground">
                                                {t("pricing.popularBadge")}
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-xl">
                                            {plan.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="text-3xl font-bold mb-6">
                                            {plan.price}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                /{t("pricing.perMonth")}
                                            </span>
                                        </div>
                                        <ul className="space-y-3 text-sm text-muted-foreground">
                                            {plan.features.map((feat, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center"
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                    {feat}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            variant={
                                                (plan as any).popular
                                                    ? "default"
                                                    : "outline"
                                            }
                                        >
                                            {t("pricing.choosePlan")}{" "}
                                            {plan.name}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </ScrollAnimation>
                        ))}
                    </div>
                </section>

                {/* --- FAQ SECTION --- */}
                <section
                    id="faq"
                    className="container py-12 md:py-24 mx-auto"
                >
                    <div className="mx-auto max-w-[58rem]">
                        <h2 className="mb-12 text-3xl font-bold text-center sm:text-5xl">
                            {t("faq.title")}
                        </h2>
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                >
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                {/* --- CTA BOTTOM --- */}
                <section className="bg-primary py-12 md:py-24 text-primary-foreground overflow-hidden relative mx-auto">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <ScrollAnimation animation="scale-up">
                        <div className="container flex flex-col items-center text-center gap-6 relative z-10">
                            <h2 className="text-3xl font-bold sm:text-4xl">
                                {t("cta.title")}
                            </h2>
                            <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                                {t("cta.subtitle")}
                            </p>
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="gap-2 h-12 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all"
                                >
                                    {t("cta.button")}{" "}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </ScrollAnimation>
                </section>
            </main>


        </div>
    );
}
