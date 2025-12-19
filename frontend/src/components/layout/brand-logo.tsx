'use client';

import { Link } from "@/i18n/routing";
import { Package2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
    href?: string;
    disabled?: boolean;
    className?: string;
    showText?: boolean;
    onClick?: () => void;
    variant?: 'default' | 'flat';
}

export function BrandLogo({
    href = "/",
    disabled = false,
    className,
    showText = true,
    onClick,
    variant = 'default'
}: BrandLogoProps) {
    const isFlat = variant === 'flat';

    const content = (
        <>
            <div className={cn(
                "flex items-center justify-center",
                isFlat ? "bg-yellow-300 dark:bg-yellow-500 border-2 border-black dark:border-white p-1" : ""
            )}>
                <Package2 className="h-6 w-6 text-black" />
            </div>
            {showText && (
                <span className={cn(
                    "font-black text-lg uppercase tracking-tight",
                    !isFlat && "hidden sm:inline-block text-black"
                )}>
                    Lumbung
                </span>
            )}
        </>
    );

    const baseClasses = cn(
        "flex items-center gap-2 transition-all",
        !isFlat && "border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 p-2",
        !disabled && !isFlat && "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_#ffffff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        disabled && "opacity-80 cursor-not-allowed bg-yellow-300 dark:bg-yellow-500",
        className
    );

    if (disabled) {
        return (
            <div className={baseClasses} onClick={onClick}>
                {content}
            </div>
        );
    }

    return (
        <Link href={href} className={baseClasses} onClick={onClick}>
            {content}
        </Link>
    );
}
