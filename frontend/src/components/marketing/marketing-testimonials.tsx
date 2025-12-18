"use client";

import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InfiniteMovingCardsZoom } from "@/components/ui/infinite-moving-cards-zoom";
import { getTestimonials } from "@/services/marketingService";
import { useEffect, useState } from "react";
import { Testimonial } from "@/types/marketing";

export function MarketingTestimonials() {
    const t = useTranslations("Landing");
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getTestimonials();
            setTestimonials(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const testimonialItems = testimonials.map((item, index) => (
        <div key={item.id || index} className="flex flex-col justify-between h-[350px] w-[350px] bg-white dark:bg-black border-2 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] transition-all">
            <div className="mb-4">
                <div className="inline-flex items-center justify-center p-2 bg-yellow-300 border-2 border-black dark:border-white mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#ffffff]">
                    <Quote className="h-6 w-6 text-black" />
                </div>
                <p className="text-base text-black dark:text-white font-medium leading-relaxed line-clamp-4">
                    "{item.content}"
                </p>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t-2 border-black/10 dark:border-white/20">
                <Avatar className="h-10 w-10 border-2 border-black dark:border-white rounded-none">
                    <AvatarImage src={item.avatar?.length! > 3 ? item.avatar : ""} />
                    <AvatarFallback className="bg-neutral-200 font-bold text-black rounded-none">
                        {item.avatar?.length! <= 3 ? item.avatar : item.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-bold leading-none text-black dark:text-white">
                        {item.name}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                        {item.role}
                    </p>
                </div>
            </div>
        </div>
    ));

    if (loading) return null; // Or a skeleton loader if preferred

    return (
        <section
            id="testimonials"
            className="container py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-neutral-900/50 rounded-none border-2 border-black dark:border-white/20 mx-auto overflow-hidden"
        >
            <ScrollAnimation>
                <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-8">
                    <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                        {t("testimonials.title")}
                    </h2>
                    <p className="text-muted-foreground max-w-[42rem]">
                        {t("testimonials.subtitle")}
                    </p>
                </div>
            </ScrollAnimation>

            <div className="w-full relative">
                <InfiniteMovingCardsZoom
                    items={testimonialItems}
                    direction="left"
                    speed="normal"
                />
            </div>
        </section>
    );
}
