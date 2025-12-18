"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 p-4">
            <div className="max-w-md w-full text-center p-8 border-4 border-black dark:border-white bg-white dark:bg-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_white]">

                <div className="inline-block bg-red-500 p-4 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white] mb-6 rotate-[6deg]">
                    <AlertTriangle className="w-12 h-12 text-white" />
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-black dark:text-white">
                    Something went wrong!
                </h1>

                <p className="text-lg font-bold mb-8 text-neutral-600 dark:text-neutral-400">
                    {error.message || "An unexpected error occurred."}
                </p>

                <Button
                    onClick={reset}
                    className="w-full font-black text-lg h-14 border-2 border-black dark:border-white rounded-none bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_white] transition-all uppercase"
                >
                    <RefreshCcw className="mr-2 h-5 w-5" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
