"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { BentoGrid } from "./bento-grid";

export function MarketingFeatures() {
    const t = useTranslations("Landing");

    return (
        <section
            id="features"
            className="relative container mx-auto space-y-12 py-12 md:py-24 lg:py-32"
        >
            {/* 1. Background Pattern Halus (Titik-titik) biar tidak sepi */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-black dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>

            <ScrollAnimation>
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
                    {/* Badge Kecil di atas Judul */}
                    <Badge variant="outline" className="rounded-none px-4 py-1.5 text-sm border-2 border-black dark:border-white/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer backdrop-blur-sm dark:text-white">
                        ✨ Features
                    </Badge>

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
        </section>
    );
}
