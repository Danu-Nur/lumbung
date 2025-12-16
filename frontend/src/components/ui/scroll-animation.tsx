"use client";

import { motion, useInView, UseInViewOptions } from "framer-motion";
import { useRef } from "react";

interface ScrollAnimationProps {
    children: React.ReactNode;
    className?: string;
    animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-up";
    delay?: number;
    duration?: number;
    viewport?: UseInViewOptions;
}

export function ScrollAnimation({
    children,
    className = "",
    animation = "fade-up",
    delay = 0,
    duration = 0.5,
    viewport = { once: true, margin: "-100px" },
}: ScrollAnimationProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, viewport);

    const variants = {
        hidden: {
            opacity: 0,
            y: animation === "fade-up" ? 20 : 0,
            x: animation === "slide-left" ? -20 : animation === "slide-right" ? 20 : 0,
            scale: animation === "scale-up" ? 0.95 : 1,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: {
                duration,
                delay,
                ease: "easeOut" as const,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
}
