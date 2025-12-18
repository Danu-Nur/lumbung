"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";

export const InfiniteMovingCardsZoom = ({
    items,
    direction = "left",
    speed = "normal",
    pauseOnHover = true,
    className,
}: {
    items: React.ReactNode[];
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    pauseOnHover?: boolean;
    className?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLUListElement>(null);

    const [start, setStart] = useState(false);

    useEffect(() => {
        addAnimation();
    }, []);

    function addAnimation() {
        if (containerRef.current && scrollerRef.current) {
            const scrollerContent = Array.from(scrollerRef.current.children);

            // Duplicate items enough times to ensure smooth scrolling
            // If we have few items, duplicate more
            const duplicationCount = items.length < 5 ? 4 : 2;

            for (let i = 0; i < duplicationCount; i++) {
                scrollerContent.forEach((item) => {
                    const duplicatedItem = item.cloneNode(true);
                    if (scrollerRef.current) {
                        scrollerRef.current.appendChild(duplicatedItem);
                    }
                });
            }
            setStart(true);
        }
    }

    // ZOOM EFFECT LOGIC
    useEffect(() => {
        let requestAnimationFrameId: number;

        const checkCenter = () => {
            if (!scrollerRef.current || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const containerCenter = containerRect.left + containerRect.width / 2;

            const children = Array.from(scrollerRef.current.children) as HTMLElement[];

            children.forEach((child) => {
                const childRect = child.getBoundingClientRect();
                const childCenter = childRect.left + childRect.width / 2;
                const dist = Math.abs(containerCenter - childCenter);

                // Define the zone where zoom happens (wider for smoother transition)
                const zoomZone = 400;

                let scale = 0.9;
                let opacity = 0.5;
                let zIndex = 0;

                if (dist < zoomZone) {
                    // Cosine interpolation for smoother ease-in/ease-out feeling
                    // Normalize distance: 0 (center) to 1 (edge of zone)
                    const normalizedDist = dist / zoomZone;

                    // Convert to 0 to PI for cosine curve
                    const curve = (Math.cos(normalizedDist * Math.PI) + 1) / 2; // oscillates 1 to 0 smoothly

                    // Max scale 1.15, Base scale 0.9
                    const scaleDiff = 0.25;

                    scale = 0.9 + (scaleDiff * curve);
                    opacity = 0.5 + (0.5 * curve); // Fade from 0.5 to 1.0
                    zIndex = 10;
                } else {
                    scale = 0.9;
                    opacity = 0.5;
                }

                // Apply styles directly for performance
                // IMPORTANT: Removed transition here because it conflicts with requestAnimationFrame updates
                child.style.transform = `scale(${scale})`;
                child.style.opacity = `${opacity}`;
                child.style.zIndex = `${zIndex}`;
            });

            requestAnimationFrameId = requestAnimationFrame(checkCenter);
        };

        if (start) {
            checkCenter();
        }

        return () => {
            cancelAnimationFrame(requestAnimationFrameId);
        };
    }, [start]);

    // Reactive styles for speed and direction
    const duration = speed === "fast" ? "60s" : speed === "normal" ? "120s" : "240s";
    const animDirection = direction === "left" ? "forwards" : "reverse";

    return (
        <div
            ref={containerRef}
            className={cn(
                "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
                className
            )}
            style={{
                "--animation-duration": duration,
                "--animation-direction": animDirection,
            } as React.CSSProperties}
        >
            <ul
                ref={scrollerRef}
                className={cn(
                    "flex min-w-full shrink-0 gap-4 py-12 w-max flex-nowrap", // increased py for zoom space
                    start && "animate-scroll ",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
            >
                {items.map((item, idx) => (
                    <li
                        className="w-[350px] max-w-full relative flex-shrink-0 flex items-center justify-center transform-gpu will-change-transform" // Added will-change-transform
                        style={{
                            // Initial static style to avoid flash
                            transform: "scale(0.9)",
                            opacity: 0.5
                        }}
                        key={idx}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};
