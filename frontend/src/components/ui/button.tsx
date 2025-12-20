import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-black shadow-[4px_4px_0px_0px_var(--brutal-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--brutal-shadow)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:border-white dark:shadow-[4px_4px_0px_0px_#ffffff] dark:hover:shadow-[2px_2px_0px_0px_#ffffff]",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-black dark:text-amber-600 dark:hover:bg-zinc-900",
                destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-black dark:text-red-500 dark:hover:bg-zinc-900",
                outline: "bg-background hover:bg-accent hover:text-accent-foreground dark:bg-black dark:text-white dark:hover:bg-zinc-900",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-black dark:text-secondary-foreground dark:hover:bg-zinc-900",
                ghost: "border-transparent shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0 hover:bg-accent hover:text-accent-foreground dark:text-white dark:hover:bg-zinc-900",
                link: "text-primary underline-offset-4 hover:underline border-none shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0 dark:text-white",
                red: "bg-red-400 text-black hover:bg-red-500 dark:bg-black dark:text-red-400 dark:hover:bg-zinc-900",
                orange: "bg-orange-400 text-black hover:bg-orange-500 dark:bg-black dark:text-orange-400 dark:hover:bg-zinc-900",
                amber: "bg-amber-400 text-black hover:bg-amber-500 dark:bg-black dark:text-amber-400 dark:hover:bg-zinc-900",
                yellow: "bg-yellow-400 text-black hover:bg-yellow-500 dark:bg-black dark:text-yellow-400 dark:hover:bg-zinc-900",
                lime: "bg-lime-400 text-black hover:bg-lime-500 dark:bg-black dark:text-lime-400 dark:hover:bg-zinc-900",
                green: "bg-green-400 text-black hover:bg-green-500 dark:bg-black dark:text-green-400 dark:hover:bg-zinc-900",
                emerald: "bg-emerald-400 text-black hover:bg-emerald-500 dark:bg-black dark:text-emerald-400 dark:hover:bg-zinc-900",
                teal: "bg-teal-400 text-black hover:bg-teal-500 dark:bg-black dark:text-teal-400 dark:hover:bg-zinc-900",
                cyan: "bg-cyan-400 text-black hover:bg-cyan-500 dark:bg-black dark:text-cyan-400 dark:hover:bg-zinc-900",
                sky: "bg-sky-400 text-black hover:bg-sky-500 dark:bg-black dark:text-sky-400 dark:hover:bg-zinc-900",
                blue: "bg-blue-400 text-black hover:bg-blue-500 dark:bg-black dark:text-blue-400 dark:hover:bg-zinc-900",
                indigo: "bg-indigo-400 text-black hover:bg-indigo-500 dark:bg-black dark:text-indigo-400 dark:hover:bg-zinc-900",
                violet: "bg-violet-400 text-black hover:bg-violet-500 dark:bg-black dark:text-violet-400 dark:hover:bg-zinc-900",
                purple: "bg-purple-400 text-black hover:bg-purple-500 dark:bg-black dark:text-purple-400 dark:hover:bg-zinc-900",
                fuchsia: "bg-fuchsia-400 text-black hover:bg-fuchsia-500 dark:bg-black dark:text-fuchsia-400 dark:hover:bg-zinc-900",
                pink: "bg-pink-400 text-black hover:bg-pink-500 dark:bg-black dark:text-pink-400 dark:hover:bg-zinc-900",
                rose: "bg-rose-400 text-black hover:bg-rose-500 dark:bg-black dark:text-rose-400 dark:hover:bg-zinc-900",
                slate: "bg-slate-200 text-black hover:bg-slate-300 dark:bg-black dark:text-slate-200 dark:hover:bg-zinc-900",
                gray: "bg-gray-200 text-black hover:bg-gray-300 dark:bg-black dark:text-gray-200 dark:hover:bg-zinc-900",
                zinc: "bg-zinc-200 text-black hover:bg-zinc-300 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900",
                neutral: "bg-neutral-200 text-black hover:bg-neutral-300 dark:bg-black dark:text-neutral-200 dark:hover:bg-zinc-900",
                stone: "bg-stone-200 text-black hover:bg-stone-300 dark:bg-black dark:text-stone-200 dark:hover:bg-zinc-900",
                // Mapped aliases for compatibility if needed (e.g. success/warning/info)
                success: "bg-emerald-400 text-black hover:bg-emerald-500 dark:bg-black dark:text-emerald-400 dark:hover:bg-zinc-900",
                warning: "bg-amber-400 text-black hover:bg-amber-500 dark:bg-black dark:text-amber-400 dark:hover:bg-zinc-900",
                info: "bg-cyan-400 text-black hover:bg-cyan-500 dark:bg-black dark:text-cyan-400 dark:hover:bg-zinc-900",

                // Outline Variants
                "outline-red": "bg-transparent border-red-500 text-red-600 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-zinc-900 dark:hover:text-red-400",
                "outline-orange": "bg-transparent border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white dark:border-orange-400 dark:text-orange-400 dark:hover:bg-zinc-900 dark:hover:text-orange-400",
                "outline-amber": "bg-transparent border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white dark:border-amber-400 dark:text-amber-400 dark:hover:bg-zinc-900 dark:hover:text-amber-400",
                "outline-yellow": "bg-transparent border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-zinc-900 dark:hover:text-yellow-400",
                "outline-lime": "bg-transparent border-lime-500 text-lime-600 hover:bg-lime-500 hover:text-white dark:border-lime-400 dark:text-lime-400 dark:hover:bg-zinc-900 dark:hover:text-lime-400",
                "outline-green": "bg-transparent border-green-500 text-green-600 hover:bg-green-500 hover:text-white dark:border-green-400 dark:text-green-400 dark:hover:bg-zinc-900 dark:hover:text-green-400",
                "outline-emerald": "bg-transparent border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-zinc-900 dark:hover:text-emerald-400",
                "outline-teal": "bg-transparent border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white dark:border-teal-400 dark:text-teal-400 dark:hover:bg-zinc-900 dark:hover:text-teal-400",
                "outline-cyan": "bg-transparent border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-zinc-900 dark:hover:text-cyan-400",
                "outline-sky": "bg-transparent border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white dark:border-sky-400 dark:text-sky-400 dark:hover:bg-zinc-900 dark:hover:text-sky-400",
                "outline-blue": "bg-transparent border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-zinc-900 dark:hover:text-blue-400",
                "outline-indigo": "bg-transparent border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-zinc-900 dark:hover:text-indigo-400",
                "outline-violet": "bg-transparent border-violet-500 text-violet-600 hover:bg-violet-500 hover:text-white dark:border-violet-400 dark:text-violet-400 dark:hover:bg-zinc-900 dark:hover:text-violet-400",
                "outline-purple": "bg-transparent border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white dark:border-purple-400 dark:text-purple-400 dark:hover:bg-zinc-900 dark:hover:text-purple-400",
                "outline-fuchsia": "bg-transparent border-fuchsia-500 text-fuchsia-600 hover:bg-fuchsia-500 hover:text-white dark:border-fuchsia-400 dark:text-fuchsia-400 dark:hover:bg-zinc-900 dark:hover:text-fuchsia-400",
                "outline-pink": "bg-transparent border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white dark:border-pink-400 dark:text-pink-400 dark:hover:bg-zinc-900 dark:hover:text-pink-400",
                "outline-rose": "bg-transparent border-rose-500 text-rose-600 hover:bg-rose-500 hover:text-white dark:border-rose-400 dark:text-rose-400 dark:hover:bg-zinc-900 dark:hover:text-rose-400",
                "outline-slate": "bg-transparent border-slate-500 text-slate-600 hover:bg-slate-500 hover:text-white dark:border-slate-400 dark:text-slate-400 dark:hover:bg-zinc-900 dark:hover:text-slate-400",
                "outline-gray": "bg-transparent border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white dark:border-gray-400 dark:text-gray-400 dark:hover:bg-zinc-900 dark:hover:text-gray-400",
                "outline-zinc": "bg-transparent border-zinc-500 text-zinc-600 hover:bg-zinc-500 hover:text-white dark:border-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-400",
                "outline-neutral": "bg-transparent border-neutral-500 text-neutral-600 hover:bg-neutral-500 hover:text-white dark:border-neutral-400 dark:text-neutral-400 dark:hover:bg-zinc-900 dark:hover:text-neutral-400",
                "outline-stone": "bg-transparent border-stone-500 text-stone-600 hover:bg-stone-500 hover:text-white dark:border-stone-400 dark:text-stone-400 dark:hover:bg-zinc-900 dark:hover:text-stone-400",
                "outline-success": "bg-transparent border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-zinc-900 dark:hover:text-emerald-400",
                "outline-warning": "bg-transparent border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white dark:border-amber-400 dark:text-amber-400 dark:hover:bg-zinc-900 dark:hover:text-amber-400",
                "outline-info": "bg-transparent border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-zinc-900 dark:hover:text-cyan-400",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-11 px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
