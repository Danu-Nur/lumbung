"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, Sparkles } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { Button } from "@/components/ui/button";

export function MarketingCta() {
    const t = useTranslations("Landing");

    return (
        <section className="bg-yellow-300 dark:bg-yellow-500 py-20 md:py-32 relative overflow-hidden border-t-4 border-black dark:border-white">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <ScrollAnimation animation="scale-up">
                <div className="container relative z-10 mx-auto px-4 text-center">
                    <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-8 md:p-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_#ffffff] max-w-4xl mx-auto transform rotate-1">

                        <div className="inline-block mb-6">
                            <span className="bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest px-4 py-2 text-sm md:text-base border-2 border-transparent transform -rotate-2 inline-flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                {t("cta.subtitle")}
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black dark:text-white mb-6 leading-[0.9]">
                            {t("cta.title")}
                        </h2>

                        <div className="mt-10">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="h-16 px-10 text-xl font-black rounded-none border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 uppercase tracking-wider"
                                >
                                    {t("cta.button")}
                                    <ArrowRight className="ml-3 h-6 w-6 stroke-[3px]" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </ScrollAnimation>
        </section>
    );
}
