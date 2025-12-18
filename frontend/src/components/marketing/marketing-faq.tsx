"use client";

import { useTranslations } from "next-intl";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
            className="container py-12 md:py-24 mx-auto"
        >
            <div className="mx-auto max-w-[58rem]">
                <h2 className="mb-12 text-3xl font-black uppercase tracking-tight text-center sm:text-5xl border-b-4 border-black dark:border-white inline-block mx-auto pb-2 dark:text-white">
                    {t("faq.title")}
                </h2>
                <div className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <Accordion type="single" collapsible key={index} className="w-full">
                            <AccordionItem
                                value={`item-${index}`}
                                className="border-2 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] px-4"
                            >
                                <AccordionTrigger className="text-lg font-bold hover:no-underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors dark:text-white">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-base font-medium text-neutral-600 dark:text-neutral-400">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ))}
                </div>
            </div>
        </section>
    );
}
