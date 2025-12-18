"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { FileText, Home, Layers, Settings, Shield } from "lucide-react";

const sidebarItems = [
    {
        title: "Getting Started",
        items: [
            { title: "Introduction", href: "/docs", icon: Home },
            { title: "Installation", href: "/docs/installation", icon: Layers },
            { title: "Architecture", href: "/docs/architecture", icon: FileText },
        ],
    },
    {
        title: "Core Concepts",
        items: [
            { title: "Authentication", href: "/docs/auth", icon: Shield },
            { title: "Configuration", href: "/docs/config", icon: Settings },
        ],
    }
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-full pb-20">
            {sidebarItems.map((section, index) => (
                <div key={index} className="mb-8">
                    <h4 className="mb-4 rounded-md px-2 py-1 text-sm font-black uppercase tracking-wider text-black dark:text-white bg-yellow-300 dark:bg-yellow-600 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_white]">
                        {section.title}
                    </h4>
                    <div className="grid grid-flow-row auto-rows-max text-sm gap-2">
                        {section.items.map((item, i) => {
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={cn(
                                        "group flex w-full items-center gap-2 border-2 px-3 py-2 font-bold transition-all",
                                        isActive
                                            ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-1"
                                            : "border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-neutral-900 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
