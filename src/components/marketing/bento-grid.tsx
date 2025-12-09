"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, BarChart3, Globe, Lock, Package, ShieldCheck, Activity } from "lucide-react";
import { ScrollAnimation } from "../ui/scroll-animation";

// Komponen Kecil untuk Background Pattern (Biar estetik)
const GridPattern = () => (
    <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
);

const features = [
    {
        title: "Real-time Tracking",
        description: "Monitor stock levels across all your warehouses instantly with live updates.",
        // Header Custom: Simulasi List Item yang "aktif"
        header: (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-t-xl bg-gray-50 dark:bg-neutral-900">
                <GridPattern />
                <div className="relative z-10 grid grid-cols-1 gap-2 opacity-60 mix-blend-multiply dark:mix-blend-normal">
                    <div className="h-2 w-24 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                    <div className="h-2 w-32 rounded-full bg-blue-400"></div>
                    <div className="h-2 w-20 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                </div>
                <Package className="absolute z-20 h-16 w-16 text-neutral-900/10 dark:text-white/10 blur-[1px]" />
            </div>
        ),
        icon: <Package className="h-5 w-5 text-blue-500" />,
        className: "md:col-span-2",
    },
    {
        title: "Global Access",
        description: "Manage inventory from anywhere.",
        // Header Custom: Globe yang besar
        header: (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-t-xl bg-gray-50 dark:bg-neutral-900">
                <GridPattern />
                <Globe className="relative z-10 h-20 w-20 text-neutral-200 dark:text-neutral-800" />
                <div className="absolute h-24 w-24 rounded-full bg-blue-500/20 blur-xl"></div>
            </div>
        ),
        icon: <Globe className="h-5 w-5 text-cyan-500" />,
        className: "md:col-span-1",
    },
    {
        title: "Advanced Analytics",
        description: "Gain insights with powerful tools.",
        // Header Custom: Simulasi Grafik Batang
        header: (
            <div className="relative flex h-full w-full items-end justify-center space-x-2 overflow-hidden rounded-t-xl bg-gray-50 pb-4 dark:bg-neutral-900">
                <GridPattern />
                <div className="h-8 w-4 rounded-t bg-neutral-300 dark:bg-neutral-700"></div>
                <div className="h-14 w-4 rounded-t bg-green-500/60"></div>
                <div className="h-10 w-4 rounded-t bg-neutral-300 dark:bg-neutral-700"></div>
                <div className="h-16 w-4 rounded-t bg-green-500"></div>
            </div>
        ),
        icon: <BarChart3 className="h-5 w-5 text-green-500" />,
        className: "md:col-span-1",
    },
    {
        title: "Secure & Reliable",
        description: "Enterprise-grade security for your data.",
        // Header Custom: Shield / Lock dengan aksen
        header: (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-t-xl bg-gray-50 dark:bg-neutral-900">
                <GridPattern />
                <ShieldCheck className="relative z-10 h-16 w-16 text-emerald-500/80" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent dark:from-neutral-900"></div>
            </div>
        ),
        icon: <Lock className="h-5 w-5 text-emerald-500" />,
        className: "md:col-span-2",
    },
];

export function BentoGrid() {
    return (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
                <ScrollAnimation
                    key={i}
                    delay={i * 0.1}
                    className={cn(
                        "group/bento row-span-1 flex flex-col justify-between overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition duration-300 hover:shadow-xl dark:border-white/10 dark:bg-neutral-950",
                        feature.className
                    )}
                >
                    {/* Bagian Atas: Visual / Header */}
                    <div className="h-48 w-full transition duration-300 group-hover/bento:scale-105">
                        {feature.header}
                    </div>

                    {/* Bagian Bawah: Konten Teks */}
                    <div className="flex flex-col space-y-2 p-6 transition duration-200 group-hover/bento:translate-x-1">
                        <div className="flex items-center justify-between">
                            {feature.icon}
                            {/* Ikon panah kecil yang muncul saat hover */}
                            <ArrowRight className="h-4 w-4 -translate-x-2 text-muted-foreground opacity-0 transition duration-200 group-hover/bento:translate-x-0 group-hover/bento:opacity-100" />
                        </div>

                        <div className="font-heading text-xl font-bold text-neutral-800 dark:text-neutral-100">
                            {feature.title}
                        </div>
                        <div className="text-sm font-normal text-muted-foreground leading-relaxed">
                            {feature.description}
                        </div>
                    </div>
                </ScrollAnimation>
            ))}
        </div>
    );
}