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

    // Efek yang diinginkan: mulai samar → terlihat penuh saat scroll
    const opacity = useTransform(scrollYProgress, [0, 0.6], [0.5, 2]);
    const scale = useTransform(scrollYProgress, [0, 0.6], [0.92, 1.3]);
    const y = useTransform(scrollYProgress, [0, 0.6], [120, 0]);

    return (
        <section ref={containerRef} className="relative overflow-hidden pt-16 md:pt-20 lg:pt-32 pb-20">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

            <div className="container px-4 md:px-6 relative z-10 mx-auto">
                <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link href="/about">
                            <Badge variant="outline" className="rounded-none px-4 py-1.5 text-sm border-2 border-black bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer backdrop-blur-sm">
                                Lumbung v2.0 is now live
                            </Badge>
                        </Link>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
                    >
                        Warehouse Management <br />
                        <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                            Reimagined
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
                    >
                        Stop wrestling with spreadsheets. Experience the future of inventory control with real-time tracking, AI-powered insights, and seamless team collaboration.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                    >
                        <Link href="/register">
                            <Button size="lg" className="h-12 px-8 text-base gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none w-full sm:w-auto border-2 border-black">
                                Start Free Trial <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-none w-full sm:w-auto backdrop-blur-sm bg-background/50 border-2 border-black">
                                View Pricing
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    style={{ y, opacity, scale }}
                    className="mt-16 relative mx-auto max-w-5xl perspective-1000"
                >
                    <div className="relative rounded-none border-2 border-black bg-background/50 backdrop-blur-xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden transform rotate-x-12 transition-transform hover:rotate-x-0 duration-700 ease-out group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Mockup Header */}
                        <div className="h-8 border-b bg-muted/50 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>

                        {/* Mockup Content */}
                        <div className="p-6 grid gap-6 md:grid-cols-3">
                            <div className="rounded-lg border bg-card p-4 space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Package className="h-4 w-4" /> Total Stock
                                </div>
                                <div className="text-2xl font-bold">12,450</div>
                                <div className="text-xs text-green-500">+12% from last month</div>
                            </div>

                            <div className="rounded-lg border bg-card p-4 space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <BarChart3 className="h-4 w-4" /> Revenue
                                </div>
                                <div className="text-2xl font-bold">Rp 45.2M</div>
                                <div className="text-xs text-green-500">+8% from last month</div>
                            </div>

                            <div className="rounded-lg border bg-card p-4 space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-4 w-4" /> Active Users
                                </div>
                                <div className="text-2xl font-bold">24</div>
                                <div className="text-xs text-muted-foreground">Across 3 warehouses</div>
                            </div>

                            {/* Chart Mockup */}
                            <div className="col-span-3 h-64 rounded-lg border bg-muted/20 flex items-end justify-between p-4 gap-2">
                                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.05 }}
                                        className="w-full bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-12 top-20 hidden lg:block"
                    >
                        <div className="bg-background/80 backdrop-blur-md border-2 border-black rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[200px]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-none border border-black bg-green-100 flex items-center justify-center text-green-600">
                                    <Package className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium">Stock Updated</div>
                                    <div className="text-[10px] text-muted-foreground">Just now</div>
                                </div>
                            </div>
                            <div className="text-xs">
                                Received <strong>500 units</strong> of iPhone 15 Pro Max
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -left-12 bottom-40 hidden lg:block"
                    >
                        <div className="bg-background/80 backdrop-blur-md border-2 border-black rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[200px]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-none border border-black bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium">New Member</div>
                                    <div className="text-[10px] text-muted-foreground">2 mins ago</div>
                                </div>
                            </div>
                            <div className="text-xs">
                                <strong>Sarah W.</strong> joined the Logistics Team
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}