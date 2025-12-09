"use client";

import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function AboutPage() {
    const t = useTranslations("About");

    const team = [
        {
            name: "Alex Johnson",
            role: "Founder & CEO",
            bio: "Former logistics manager turned tech entrepreneur. Passionate about efficiency.",
            avatar: "AJ",
        },
        {
            name: "Sarah Lee",
            role: "CTO",
            bio: "Full-stack wizard with 10+ years of experience in building scalable SaaS.",
            avatar: "SL",
        },
        {
            name: "Michael Chen",
            role: "Head of Product",
            bio: "Obsessed with user experience and solving real customer problems.",
            avatar: "MC",
        },
        {
            name: "Jessica Wu",
            role: "Lead Designer",
            bio: "Creating beautiful and intuitive interfaces for complex systems.",
            avatar: "JW",
        },
    ];

    const timeline = [
        {
            year: "2023",
            title: t("journey.2023.title"),
            description: t("journey.2023.desc"),
        },
        {
            year: "2024",
            title: t("journey.2024.title"),
            description: t("journey.2024.desc"),
        },
        {
            year: "2025",
            title: t("journey.2025.title"),
            description: t("journey.2025.desc"),
        },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
                <div className="container px-4 md:px-6 mx-auto">
                    <ScrollAnimation className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
                        <Badge variant="secondary" className="px-4 py-1">{t("mission.badge")}</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            {t("mission.title")}
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                            {t("mission.description")}
                        </p>
                    </ScrollAnimation>
                </div>
            </section>

            {/* Values Section */}
            <section className="container py-12 md:py-24 mx-auto">
                <div className="grid gap-8 md:grid-cols-3">
                    {[
                        { title: t("values.simplicity.title"), desc: t("values.simplicity.desc") },
                        { title: t("values.reliability.title"), desc: t("values.reliability.desc") },
                        { title: t("values.innovation.title"), desc: t("values.innovation.desc") },
                    ].map((value, i) => (
                        <ScrollAnimation key={i} delay={i * 0.1} animation="fade-up">
                            <Card className="h-full bg-slate-50 dark:bg-slate-900/50 border-none">
                                <CardContent className="p-8 space-y-4 text-center">
                                    <h3 className="text-2xl font-bold">{value.title}</h3>
                                    <p className="text-muted-foreground">{value.desc}</p>
                                </CardContent>
                            </Card>
                        </ScrollAnimation>
                    ))}
                </div>
            </section>

            {/* Timeline Section */}
            <section className="container py-12 md:py-24 mx-auto">
                <ScrollAnimation>
                    <h2 className="text-3xl font-bold text-center mb-16">{t("journey.title")}</h2>
                </ScrollAnimation>
                <div className="relative border-l border-muted ml-4 md:mx-auto md:w-2/3 space-y-12 pl-8 md:pl-12">
                    {timeline.map((item, i) => (
                        <ScrollAnimation key={i} delay={i * 0.2} animation="slide-right" className="relative">
                            <div className="absolute -left-[41px] md:-left-[57px] top-0 h-6 w-6 rounded-full border-4 border-background bg-primary" />
                            <div className="space-y-2">
                                <span className="text-sm font-bold text-primary">{item.year}</span>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-muted-foreground">{item.description}</p>
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </section>

            {/* Team Section */}
            <section className="container py-12 md:py-24 bg-slate-50 dark:bg-slate-900/20 rounded-3xl my-12 mx-auto">
                <ScrollAnimation>
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-bold">{t("team.title")}</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {t("team.subtitle")}
                        </p>
                    </div>
                </ScrollAnimation>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {team.map((member, i) => (
                        <ScrollAnimation key={i} delay={i * 0.1} animation="scale-up">
                            <div className="group flex flex-col items-center text-center space-y-4">
                                <div className="relative overflow-hidden rounded-full h-32 w-32 border-4 border-background shadow-xl">
                                    <Avatar className="h-full w-full">
                                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                            {member.avatar}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">{member.name}</h3>
                                    <p className="text-sm text-primary font-medium">{member.role}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{member.bio}</p>
                                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Github className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    <Linkedin className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    <Twitter className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                </div>
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="container py-12 md:py-24 text-center mx-auto">
                <ScrollAnimation animation="scale-up">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-3xl font-bold">{t("cta.title")}</h2>
                        <p className="text-lg text-muted-foreground">
                            {t("cta.subtitle")}
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/register">
                                <Button size="lg" className="gap-2">
                                    {t("cta.getStarted")} <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg">
                                {t("cta.careers")}
                            </Button>
                        </div>
                    </div>
                </ScrollAnimation>
            </section>
        </div>
    );
}
