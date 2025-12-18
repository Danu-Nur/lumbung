"use client";

import { useTranslations } from "next-intl";
import { Activity, Globe, TrendingDown } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export function MarketingMetrics() {
    const t = useTranslations("Landing");

    return (
        <ScrollAnimation animation="fade-up" delay={0.1}>
            <div className="py-16 mx-auto max-w-5xl">
                {/* Window / Panel Container */}
                <div className="rounded-none border-2 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] overflow-hidden">
                    {/* Title Bar */}
                    <div className="border-b-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-black bg-red-400" />
                            <div className="w-3 h-3 rounded-full border border-black bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full border border-black dark:border-white bg-green-400" />
                        </div>
                        <div className="font-mono text-xs font-bold tracking-widest text-neutral-500">
                            SYSTEM_METRICS.LOG
                        </div>
                        <div className="w-16"></div> {/* Spacer for center alignment */}
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-black dark:divide-white">
                        {/* Metric 1 */}
                        <div className="group relative p-8 bg-white dark:bg-black hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                            <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                <Activity className="w-6 h-6 text-blue-500" />
                            </div>
                            <p className="text-5xl font-black tracking-tighter text-black dark:text-white font-mono mb-2">
                                {t("metrics.itemsTracked")}
                            </p>
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-l-4 border-blue-500 pl-2">
                                {t("metrics.itemsTrackedLabel")}
                            </p>
                        </div>

                        {/* Metric 2 */}
                        <div className="group relative p-8 bg-white dark:bg-black hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                            <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                <Globe className="w-6 h-6 text-green-500" />
                            </div>
                            <p className="text-5xl font-black tracking-tighter text-black dark:text-white font-mono mb-2">
                                {t("metrics.timeSaved")}
                            </p>
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-l-4 border-green-500 pl-2">
                                {t("metrics.timeSavedLabel")}
                            </p>
                        </div>

                        {/* Metric 3 */}
                        <div className="group relative p-8 bg-white dark:bg-black hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                            <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                <TrendingDown className="w-6 h-6 text-purple-500" />
                            </div>
                            <p className="text-5xl font-black tracking-tighter text-black dark:text-white font-mono mb-2">
                                {t("metrics.errorReduced")}
                            </p>
                            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest border-l-4 border-purple-500 pl-2">
                                {t("metrics.errorReducedLabel")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollAnimation>
    );
}
