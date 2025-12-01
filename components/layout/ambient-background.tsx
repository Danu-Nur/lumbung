import { cn } from "@/lib/utils";

export function AmbientBackground({ className }: { className?: string }) {
    return (
        <div className={cn("fixed inset-0 -z-20 overflow-hidden pointer-events-none", className)}>
            <div className="blob w-96 h-96 bg-primary-300 dark:bg-primary-900 top-0 left-0 animate-blob"></div>
            <div
                className="blob w-96 h-96 bg-secondary-300 dark:bg-secondary-900 bottom-0 right-0 animate-blob"
                style={{ animationDelay: '2s' }}
            ></div>
            <div
                className="blob w-80 h-80 bg-emerald-300 dark:bg-emerald-900 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-blob"
                style={{ animationDelay: '4s' }}
            ></div>
        </div>
    );
}
