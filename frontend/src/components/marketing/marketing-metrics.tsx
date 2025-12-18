"use client";

import { useTranslations } from "next-intl";
import { Activity, Globe, TrendingDown } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export function MarketingMetrics() {
    const t = useTranslations("Landing");

    return (
        <ScrollAnimation animation="fade-up" delay={0.1}>
            <section className="container mx-auto px-4">
                <div className="py-16 mx-auto max-w-6xl">
                    {/* Window / Panel Container */}
                    <div className="rounded-none border-4 border-black dark:border-white bg-white dark:bg-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_#ffffff] overflow-hidden">
                        {/* Title Bar */}
                        <div className="border-b-4 border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-none border-2 border-black dark:border-white bg-red-400 dark:bg-red-600" />
                                <div className="w-4 h-4 rounded-none border-2 border-black dark:border-white bg-yellow-400 dark:bg-yellow-600" />
                                <div className="w-4 h-4 rounded-none border-2 border-black dark:border-white bg-green-400 dark:bg-green-600" />
                            </div>
                            <div className="font-mono text-sm font-black tracking-widest text-black dark:text-white uppercase bg-white dark:bg-black px-4 py-1 border-2 border-black dark:border-white">
                                SYSTEM_METRICS.LOG
                            </div>
                            <div className="w-20"></div> {/* Spacer for center alignment */}
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black dark:divide-white">
                            {/* Metric 1 */}
                            <div className="group relative p-10 bg-cyan-100 dark:bg-cyan-900/40 hover:bg-cyan-200 dark:hover:bg-cyan-900/60 transition-colors">
                                <div className="absolute top-4 right-4 bg-white dark:bg-black border-2 border-black dark:border-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                    <Activity className="w-6 h-6 text-black dark:text-white stroke-[3px]" />
                                </div>
                                <p className="text-6xl font-black tracking-tighter text-black dark:text-white font-mono mb-4 mt-2">
                                    {t("metrics.itemsTracked")}
                                </p>
                                <p className="text-sm font-black text-black dark:text-white uppercase tracking-widest bg-white dark:bg-black inline-block px-2 py-1 border-2 border-black dark:border-white transform -rotate-1">
                                    {t("metrics.itemsTrackedLabel")}
                                </p>
                            </div>

                            {/* Metric 2 */}
                            <div className="group relative p-10 bg-lime-100 dark:bg-lime-900/40 hover:bg-lime-200 dark:hover:bg-lime-900/60 transition-colors">
                                <div className="absolute top-4 right-4 bg-white dark:bg-black border-2 border-black dark:border-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                    <Globe className="w-6 h-6 text-black dark:text-white stroke-[3px]" />
                                </div>
                                <p className="text-6xl font-black tracking-tighter text-black dark:text-white font-mono mb-4 mt-2">
                                    {t("metrics.timeSaved")}
                                </p>
                                <p className="text-sm font-black text-black dark:text-white uppercase tracking-widest bg-white dark:bg-black inline-block px-2 py-1 border-2 border-black dark:border-white transform rotate-1">
                                    {t("metrics.timeSavedLabel")}
                                </p>
                            </div>

                            {/* Metric 3 */}
                            <div className="group relative p-10 bg-pink-100 dark:bg-pink-900/40 hover:bg-pink-200 dark:hover:bg-pink-900/60 transition-colors">
                                <div className="absolute top-4 right-4 bg-white dark:bg-black border-2 border-black dark:border-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                    <TrendingDown className="w-6 h-6 text-black dark:text-white stroke-[3px]" />
                                </div>
                                <p className="text-6xl font-black tracking-tighter text-black dark:text-white font-mono mb-4 mt-2">
                                    {t("metrics.errorReduced")}
                                </p>
                                <p className="text-sm font-black text-black dark:text-white uppercase tracking-widest bg-white dark:bg-black inline-block px-2 py-1 border-2 border-black dark:border-white transform -rotate-1">
                                    {t("metrics.errorReducedLabel")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </ScrollAnimation>
    );
}
