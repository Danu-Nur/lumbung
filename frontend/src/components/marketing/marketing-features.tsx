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
            <ScrollAnimation>
                <div className="mx-auto flex max-w-[64rem] flex-col items-center space-y-6 text-center mb-16">
                    <Badge variant="outline" className="rounded-none px-4 py-1.5 text-sm font-black border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] transform rotate-2 uppercase tracking-wider">
                        ✨ Features
                    </Badge>

                    <h2 className="font-black text-4xl leading-[1.1] sm:text-4xl md:text-6xl uppercase tracking-tight text-black dark:text-white relative inline-block">
                        <span className="relative z-10">{t("features.title")}</span>
                        <div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-300 dark:bg-yellow-600 -z-0 transform -rotate-1 skew-x-12"></div>
                    </h2>

                    <div className="max-w-[85%] mx-auto relative">
                        <div className="absolute -inset-1 bg-black dark:bg-white transform translate-x-2 translate-y-2"></div>
                        <p className="relative z-10 bg-white dark:bg-neutral-900 border-2 border-black dark:border-white p-6 font-bold text-lg sm:text-xl text-black dark:text-white leading-relaxed">
                            {t("features.subtitle")}
                        </p>
                    </div>
                </div>
            </ScrollAnimation>

            <div className="py-4">
                <BentoGrid />
            </div>
        </section>
    );
}
