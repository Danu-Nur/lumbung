"use client";

import { cn } from "@/lib/utils";
import {
    ArrowRight,
    BarChart3,
    Box,
    LineChart,
    Map,
    ScanBarcode,
    Users,
    Smartphone,
    CreditCard,
    FileText,
    Shield,
    Truck,
    Factory
} from "lucide-react";
import { ScrollAnimation } from "../ui/scroll-animation";

// Komponen Kecil untuk Background Pattern
const GridPattern = () => (
    <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#00000012_1px,transparent_1px),linear-gradient(to_bottom,#00000012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
);

const features = [
    {
        title: "Total Inventory Control",
        description: "The heart of your operation. Manage item variants, stock levels, and precise locations in a spreadsheet-like interface.",
        header: (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-yellow-300 border-b-2 border-black p-6">
                <GridPattern />
                {/* Visual: Mini UI Table */}
                <div className="relative z-10 w-full max-w-[90%] bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-transform group-hover/bento:-translate-y-2">
                    {/* Header Table */}
                    <div className="h-8 border-b-2 border-black bg-neutral-100 flex items-center px-2 gap-2">
                        <div className="w-2 h-2 rounded-full border border-black bg-red-400"></div>
                        <div className="w-2 h-2 rounded-full border border-black bg-yellow-400"></div>
                        <div className="w-2 h-2 rounded-full border border-black bg-green-400"></div>
                    </div>
                    {/* Rows */}
                    <div className="p-2 space-y-2">
                        <div className="flex items-center justify-between border-b border-dashed border-black/20 pb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-100 border border-black flex items-center justify-center"><Box className="w-3 h-3" /></div>
                                <div className="space-y-1">
                                    <div className="w-16 h-2 bg-black/80"></div>
                                    <div className="w-10 h-1.5 bg-black/20"></div>
                                </div>
                            </div>
                            <div className="px-2 py-0.5 bg-green-200 border border-black text-[8px] font-bold">IN STOCK</div>
                        </div>
                        <div className="flex items-center justify-between border-b border-dashed border-black/20 pb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-purple-100 border border-black flex items-center justify-center"><Box className="w-3 h-3" /></div>
                                <div className="space-y-1">
                                    <div className="w-20 h-2 bg-black/80"></div>
                                    <div className="w-8 h-1.5 bg-black/20"></div>
                                </div>
                            </div>
                            <div className="px-2 py-0.5 bg-yellow-200 border border-black text-[8px] font-bold">LOW</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-orange-100 border border-black flex items-center justify-center"><Box className="w-3 h-3" /></div>
                                <div className="w-12 h-2 bg-black/80"></div>
                            </div>
                            <div className="w-8 h-4 bg-black/10"></div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        icon: <Box className="h-6 w-6 text-black dark:text-white" />,
        className: "md:col-span-2",
    },
    {
        title: "Barcode Ecosystem",
        description: "Generate Code-128 labels and scan via App.",
        header: (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-pink-300 border-b-2 border-black p-4">
                <GridPattern />
                {/* Visual: Phone Scanning */}
                <div className="relative z-10 w-24 h-40 bg-white border-2 border-black rounded-[1rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center p-2 group-hover/bento:rotate-2 transition-transform">
                    <div className="w-8 h-1 bg-black/10 rounded-full mb-2"></div>
                    <div className="flex-1 w-full bg-neutral-100 border border-black/20 relative overflow-hidden flex flex-col items-center justify-center">
                        <div className="w-[80%] h-12 border-2 border-black bg-white flex flex-col items-center justify-center gap-1">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-4 w-0.5 bg-black ${i % 2 === 0 ? 'w-1' : ''}`}></div>)}
                            </div>
                        </div>
                        <div className="absolute top-1/2 w-full h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-black mt-2"></div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black text-white px-2 py-1 text-[10px] font-bold border-2 border-white -rotate-6">
                    SCAN OK!
                </div>
            </div>
        ),
        icon: <ScanBarcode className="h-6 w-6 text-black dark:text-white" />,
        className: "md:col-span-1",
    },
    {
        title: "Profit & Expenses",
        description: "Real-time financial dashboard.",
        header: (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-emerald-300 border-b-2 border-black p-4">
                <GridPattern />
                {/* Visual: Revenue Card */}
                <div className="relative z-10 w-full max-w-[160px] bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3 group-hover/bento:scale-105 transition-transform">
                    <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 border border-black flex items-center justify-center">
                            <span className="text-green-600 font-bold">$</span>
                        </div>
                        <div className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5">+12.5%</div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-black">$24,500</div>
                        <div className="text-[10px] text-neutral-500 font-bold">TOTAL PROFIT</div>
                    </div>
                    <div className="flex items-end gap-1 h-8 mt-1">
                        <div className="w-1/4 bg-green-200 h-full border border-black"></div>
                        <div className="w-1/4 bg-green-300 h-[60%] border border-black"></div>
                        <div className="w-1/4 bg-green-400 h-[80%] border border-black"></div>
                        <div className="w-1/4 bg-green-500 h-[100%] border border-black"></div>
                    </div>
                </div>
            </div>
        ),
        icon: <LineChart className="h-6 w-6 text-black dark:text-white" />,
        className: "md:col-span-1",
    },
    {
        title: "Supply Chain & Multi-WH",
        description: "Visualize your entire logistics flow. From Supplier purchase orders to Inter-warehouse transfers.",
        header: (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-blue-300 border-b-2 border-black p-4">
                <GridPattern />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[80%] h-px border-t-2 border-dashed border-black/30"></div>
                </div>
                {/* Visual: Flowchart */}
                <div className="relative z-10 flex gap-4 md:gap-8 items-center w-full justify-center">
                    {/* Step 1: Factory */}
                    <div className="flex flex-col items-center gap-2 group-hover/bento:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                            <Factory className="w-6 h-6 text-black" />
                        </div>
                        <span className="bg-white border border-black px-1.5 py-0.5 text-[9px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">SUPPLIER</span>
                    </div>

                    <ArrowRight className="w-6 h-6 text-black shrink-0 animate-pulse" />

                    {/* Step 2: Warehouse */}
                    <div className="flex flex-col items-center gap-2 group-hover/bento:-translate-y-1 transition-transform delay-75">
                        <div className="w-12 h-12 bg-orange-200 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                            <Box className="w-6 h-6 text-black" />
                        </div>
                        <span className="bg-white border border-black px-1.5 py-0.5 text-[9px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">STORE</span>
                    </div>

                    <ArrowRight className="w-6 h-6 text-black shrink-0 animate-pulse" />

                    {/* Step 3: Truck */}
                    <div className="flex flex-col items-center gap-2 group-hover/bento:-translate-y-1 transition-transform delay-150">
                        <div className="w-12 h-12 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                            <Truck className="w-6 h-6 text-black" />
                        </div>
                        <span className="bg-white border border-black px-1.5 py-0.5 text-[9px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">LOGISTIC</span>
                    </div>
                </div>
            </div>
        ),
        icon: <Map className="h-6 w-6 text-black dark:text-white" />,
        className: "md:col-span-2",
    },
    {
        title: "Reports & Forecasting",
        description: "AI-driven demand prediction and one-click PDF/Excel export for your accounting.",
        header: (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-orange-300 border-b-2 border-black p-4">
                <GridPattern />
                {/* Visual: Document */}
                <div className="relative z-10 w-32 h-40 bg-white border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] p-3 flex flex-col gap-2 rotate-2 transition-transform group-hover/bento:rotate-0">
                    <div className="flex items-center gap-2 border-b border-black pb-1">
                        <div className="w-6 h-6 bg-red-500 border border-black rounded-full flex items-center justify-center text-[8px] font-bold text-white">PDF</div>
                        <div className="flex-1 h-1 bg-black/10"></div>
                    </div>
                    <div className="flex items-center justify-center py-2">
                        <div className="w-12 h-12 rounded-full border-2 border-black bg-neutral-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-6 h-6 bg-blue-400 border-l border-b border-black"></div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="w-full h-1 bg-black/80"></div>
                        <div className="w-full h-1 bg-black/20"></div>
                        <div className="w-2/3 h-1 bg-black/20"></div>
                    </div>
                </div>
            </div>
        ),
        icon: <BarChart3 className="h-6 w-6 text-black dark:text-white" />,
        className: "md:col-span-2",
    },
    {
        title: "Access Control & Security",
        description: "Fine-grained permissions for every role.",
        header: (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-purple-300 border-b-2 border-black p-4">
                <GridPattern />
                {/* Visual: Toggle UI */}
                <div className="relative z-10 w-full max-w-[150px] bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold">EDIT_ITEMS</span>
                        <div className="w-8 h-4 bg-green-400 border border-black rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white border border-black rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between opacity-50">
                        <span className="text-[10px] font-bold">DELETE_LOGS</span>
                        <div className="w-8 h-4 bg-neutral-300 border border-black rounded-full relative">
                            <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white border border-black rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold">VIEW-REPO</span>
                        <div className="w-8 h-4 bg-green-400 border border-black rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white border border-black rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        icon: <Shield className="h-6 w-6 text-black dark:text-white" />,
        className: "md:col-span-1",
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
                        "group/bento row-span-1 flex flex-col justify-between overflow-hidden rounded-none border-2 border-black dark:border-white bg-white dark:bg-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] transition-all duration-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_#ffffff] hover:translate-x-[4px] hover:translate-y-[4px]",
                        feature.className
                    )}
                >
                    {/* Visual Header - Increased Height */}
                    <div className="h-64 w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 border-b-2 border-black dark:border-white relative">
                        {feature.header}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col space-y-4 p-6 bg-white dark:bg-black relative z-20">
                        <div className="flex items-center justify-between">
                            <div className="p-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#ffffff] bg-white dark:bg-black rounded-none">
                                {feature.icon}
                            </div>
                            <ArrowRight className="h-5 w-5 text-black dark:text-white -translate-x-4 opacity-0 transition-all duration-300 group-hover/bento:translate-x-0 group-hover/bento:opacity-100" />
                        </div>

                        <div>
                            <h3 className="font-heading text-xl font-bold text-black dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                </ScrollAnimation>
            ))}
        </div>
    );
}
