"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 p-4">
            <div className="max-w-md w-full text-center p-8 border-4 border-black dark:border-white bg-white dark:bg-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_white]">

                <div className="inline-block bg-pink-400 dark:bg-pink-600 p-4 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white] mb-6 rotate-[-6deg]">
                    <span className="text-5xl font-black text-black dark:text-white">404</span>
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-black dark:text-white">
                    Page Not Found
                </h1>

                <p className="text-lg font-bold mb-8 text-neutral-600 dark:text-neutral-400">
                    The page you are looking for does not exist or has been moved.
                </p>

                <Link href="/">
                    <Button className="w-full font-black text-lg h-14 border-2 border-black dark:border-white rounded-none bg-cyan-300 text-black hover:bg-cyan-400 dark:bg-cyan-600 dark:text-white dark:hover:bg-cyan-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_white] transition-all uppercase">
                        <FileQuestion className="mr-2 h-5 w-5" />
                        Return Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
