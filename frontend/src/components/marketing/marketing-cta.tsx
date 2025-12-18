"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { Button } from "@/components/ui/button";

export function MarketingCta() {
    const t = useTranslations("Landing");

    return (
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
                            className="gap-2 h-12 px-8 rounded-none border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_#ffffff] transition-all bg-white text-black hover:bg-neutral-100"
                        >
                            {t("cta.button")}{" "}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </ScrollAnimation>
        </section>
    );
}
