"use client";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight, BarChart3, Package, Users } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.6], [0.5, 1]);
    const scale = useTransform(scrollYProgress, [0, 0.6], [0.8, 1]);
    const y = useTransform(scrollYProgress, [0, 0.6], [100, 0]);

    return (
        <section ref={containerRef} className="relative overflow-hidden py-24 md:py-32 bg-[#FFD700] dark:bg-yellow-600 border-b-4 border-black dark:border-white transition-colors duration-300">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

            <div className="container px-4 md:px-6 relative z-10 mx-auto">
                <div className="flex flex-col items-center text-center gap-8 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link href="/about">
                            <Badge variant="outline" className="rounded-none px-4 py-1.5 text-sm font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-white/80 transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                NEW: LUMBUNG v2.0 IS LIVE
                            </Badge>
                        </Link>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black dark:text-white uppercase leading-[0.9]"
                    >
                        WAREHOUSE <br />
                        <span className="bg-white dark:bg-black text-black dark:text-white px-4 border-4 border-black dark:border-white inline-block transform -rotate-2 mt-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#ffffff]">
                            REIMAGINED
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl font-bold bg-white dark:bg-black border-2 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] text-black dark:text-white max-w-3xl transform rotate-1"
                    >
                        Stop wrestling with spreadsheets. Experience the future of inventory control with real-time tracking and seamless collaboration.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto mt-4"
                    >
                        <Link href="/register">
                            <Button size="lg" className="h-16 px-10 text-xl font-black gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_#ffffff] hover:-translate-y-1 transition-all rounded-none w-full sm:w-auto border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black uppercase">
                                Start Free Trial <ArrowRight className="h-6 w-6" />
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="outline" size="lg" className="h-16 px-10 text-xl font-black rounded-none w-full sm:w-auto border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_#ffffff] hover:-translate-y-1 uppercase">
                                View Pricing
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* mockup  */}
                <motion.div
                    style={{ y, opacity, scale }}
                    className="pt-24 pb-12 relative mx-auto max-w-6xl perspective-1000"
                >
                    <div className="relative rounded-none border-4 border-black dark:border-white bg-white dark:bg-neutral-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_#ffffff] overflow-hidden transform group mx-4">

                        {/* Mockup Header */}
                        <div className="h-12 border-b-4 border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 flex items-center px-6 gap-4 justify-between">
                            <div className="flex gap-3">
                                <div className="w-4 h-4 rounded-none bg-black dark:bg-white" />
                                <div className="w-4 h-4 rounded-none border-2 border-black dark:border-white" />
                                <div className="w-4 h-4 rounded-full border-2 border-black dark:border-white" />
                            </div>
                            <div className="font-mono font-bold text-sm bg-white dark:bg-black border-2 border-black dark:border-white px-4 py-1">LUMBUNG_DASHBOARD.EXE</div>
                        </div>

                        {/* Mockup Content */}
                        <div className="p-6 md:p-10 grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
                            {/* Cards */}
                            <div className="rounded-none border-2 border-black dark:border-white bg-blue-100 dark:bg-blue-900/30 p-6 space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                                    <Package className="h-5 w-5" /> Total Stock
                                </div>
                                <div className="text-4xl font-black text-black dark:text-white">12,450</div>
                                <div className="text-sm font-bold text-black dark:text-white bg-green-400 dark:bg-green-600 inline-block px-2 border border-black dark:border-white transform -rotate-1">+12% INCREASE</div>
                            </div>

                            <div className="rounded-none border-2 border-black dark:border-white bg-pink-100 dark:bg-pink-900/30 p-6 space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                                    <BarChart3 className="h-5 w-5" /> Revenue
                                </div>
                                <div className="text-4xl font-black text-black dark:text-white">Rp 45.2M</div>
                                <div className="text-sm font-bold text-black dark:text-white bg-yellow-400 dark:bg-yellow-600 inline-block px-2 border border-black dark:border-white transform rotate-1">ON TARGET</div>
                            </div>

                            <div className="rounded-none border-2 border-black dark:border-white bg-green-100 dark:bg-green-900/30 p-6 space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                                    <Users className="h-5 w-5" /> Active Users
                                </div>
                                <div className="text-4xl font-black text-black dark:text-white">24</div>
                                <div className="text-sm font-bold text-black/60 dark:text-white/60">Across 3 warehouses</div>
                            </div>

                            {/* Chart Mockup - Neo Brutalist */}
                            <div className="col-span-1 md:col-span-3 h-64 md:h-80 rounded-none border-2 border-black dark:border-white bg-white dark:bg-black p-8 relative flex items-end justify-between gap-4 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                                {/* Horizontal Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between p-8 -z-0 pointer-events-none opacity-20">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="w-full h-0.5 bg-black dark:bg-white border-t border-dashed border-black dark:border-white" />
                                    ))}
                                </div>

                                {/* Bars Group */}
                                {[
                                    { jan: [40, 65] },
                                    { feb: [85, 55] },
                                    { mar: [45, 75] },
                                    { apr: [60, 45] },
                                    { may: [70, 60] },
                                    { jun: [90, 75] },
                                    { jul: [55, 85] }
                                ].map((group, i) => {
                                    const values = Object.values(group)[0];
                                    const label = Object.keys(group)[0];
                                    return (
                                        <div key={i} className="relative z-10 flex flex-col items-center gap-2 h-full justify-end flex-1 group/bar">
                                            <div className="flex items-end gap-1 md:gap-2 h-full pb-8 w-full justify-center">
                                                {/* Bar 1 */}
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${values[0]}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.1, ease: "backOut" }}
                                                    className="w-full max-w-[20px] md:max-w-[40px] bg-cyan-400 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#ffffff] group-hover/bar:translate-y-[-4px] transition-transform"
                                                />
                                                {/* Bar 2 */}
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${values[1]}%` }}
                                                    transition={{ duration: 0.8, delay: (i * 0.1) + 0.1, ease: "backOut" }}
                                                    className="w-full max-w-[20px] md:max-w-[40px] bg-pink-400 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#ffffff] group-hover/bar:translate-y-[-4px] transition-transform"
                                                />
                                            </div>
                                            <div className="absolute bottom-0 text-xs md:text-sm font-black uppercase tracking-wider text-black dark:text-white border-t-2 border-black dark:border-white w-full text-center pt-1">
                                                {label}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Floating Element 1 */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-8 top-32 hidden lg:block z-20"
                    >
                        <div className="bg-yellow-300 border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-[240px] transform rotate-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center text-black font-black text-xl">
                                    !
                                </div>
                                <div>
                                    <div className="text-sm font-black text-black uppercase">Low Stock Alert</div>
                                    <div className="text-xs font-bold text-black/70">Warehouse A</div>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-black border-t-2 border-black pt-2 mt-2">
                                Item <strong>"Indomie Goreng"</strong> is below 50 units!
                            </div>
                        </div>
                    </motion.div>

                    {/* Floating Element 2 */}
                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -left-8 bottom-48 hidden lg:block z-20"
                    >
                        <div className="bg-lime-300 border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-[240px] transform -rotate-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center text-black">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-black uppercase">New Staff</div>
                                    <div className="text-xs font-bold text-black/70">Just now</div>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-black border-t-2 border-black pt-2 mt-2">
                                <strong>Budi Santoso</strong> has joined the team.
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
