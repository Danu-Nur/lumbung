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
        <div key={item.id || index} className="flex flex-col justify-between h-[400px] w-[350px] bg-white dark:bg-neutral-900 border-2 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_#ffffff]">
            <div className="mb-4 relative">
                <div className="absolute -top-10 -left-2 bg-yellow-400 dark:bg-yellow-600 border-2 border-black dark:border-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#ffffff] transform -rotate-6 z-10">
                    <Quote className="h-6 w-6 text-black" fill="currentColor" />
                </div>
                <div className="mt-6 border-l-4 border-black dark:border-white pl-4 py-2">
                    <p className="text-lg text-black dark:text-white font-bold leading-normal italic">
                        "{item.content}"
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t-4 border-black dark:border-white bg-neutral-50 dark:bg-neutral-800 -mx-6 -mb-6 p-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-black dark:bg-white translate-x-1 translate-y-1"></div>
                    <Avatar className="h-12 w-12 border-2 border-black dark:border-white rounded-none relative z-10">
                        <AvatarImage src={item.avatar?.length! > 3 ? item.avatar : ""} />
                        <AvatarFallback className="bg-pink-400 dark:bg-pink-600 font-black text-white rounded-none">
                            {item.avatar?.length! <= 3 ? item.avatar : item.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <p className="text-base font-black leading-none text-black dark:text-white uppercase tracking-wide">
                        {item.name}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 font-bold mt-1 bg-white dark:bg-black inline-block px-1 border border-black dark:border-white">
                        {item.role}
                    </p>
                </div>
            </div>
        </div>
    ));

    if (loading) return null;

    return (
        <section
            id="testimonials"
            className="py-20 md:py-32 bg-[#fff1f2] dark:bg-black border-y-4 border-black dark:border-white overflow-hidden relative"
        >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <ScrollAnimation>
                <div className="container mx-auto flex flex-col items-center justify-center gap-6 text-center mb-16 relative z-10">
                    <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-1 font-black transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                        WALL OF LOVE
                    </div>
                    <h2 className="font-black text-4xl md:text-6xl uppercase tracking-tighter text-black dark:text-white">
                        {t("testimonials.title")}
                    </h2>
                    <p className="text-xl font-bold text-black dark:text-gray-300 max-w-[42rem] mx-auto leading-relaxed border-b-4 border-transparent hover:border-pink-500 transition-colors inline-block">
                        {t("testimonials.subtitle")}
                    </p>
                </div>
            </ScrollAnimation>

            <div className="mx-auto w-full relative z-10">
                <InfiniteMovingCardsZoom
                    items={testimonialItems}
                    direction="left"
                    speed="normal"
                />
            </div>
        </section>
    );
}
