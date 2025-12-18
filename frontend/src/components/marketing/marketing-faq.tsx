"use client";

import { useTranslations } from "next-intl";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export function MarketingFaq() {
    const t = useTranslations("Landing");

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
        <section
            id="faq"
            className="container py-12 md:py-24 mx-auto relative"
        >
            {/* Decorative Element */}
            <div className="absolute top-10 right-10 hidden lg:block opacity-20 pointer-events-none transform rotate-12">
                <span className="text-[200px] font-black text-black dark:text-white leading-none">?</span>
            </div>

            <ScrollAnimation>
                <div className="mx-auto max-w-[58rem]">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest px-4 py-1 transform -rotate-2 mb-4">
                            Have Questions?
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter sm:text-6xl text-black dark:text-white">
                            {t("faq.title")}
                        </h2>
                    </div>

                    <div className="w-full space-y-6">
                        {faqs.map((faq, index) => (
                            <Accordion type="single" collapsible key={index} className="w-full">
                                <AccordionItem
                                    value={`item-${index}`}
                                    className="border-4 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] px-6 py-2 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_#ffffff] transition-all duration-200"
                                >
                                    <AccordionTrigger className="text-lg md:text-xl font-bold hover:no-underline hover:text-black/70 dark:hover:text-white/70 transition-colors text-black dark:text-white text-left uppercase tracking-tight">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-base md:text-lg font-medium text-black/80 dark:text-white/80 leading-relaxed border-t-2 border-black/10 dark:border-white/20 pt-4 mt-2">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))}
                    </div>
                </div>
            </ScrollAnimation>
        </section>
    );
}
