import { Construction } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
    title?: string;
    description?: string;
}

export function ComingSoon({
    title = "Under Construction",
    description = "We are working hard to bring this page to life. Stay tuned for updates!"
}: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_white]">
            <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white] mb-6 rotate-3">
                <Construction className="w-16 h-16 text-black dark:text-white" />
            </div>

            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">
                {title}
            </h2>

            <p className="text-xl font-bold mb-8 max-w-md text-black/80 dark:text-white/80">
                {description}
            </p>

            <Link href="/">
                <Button className="font-black text-lg h-12 px-8 border-2 border-black dark:border-white rounded-none bg-white text-black hover:bg-neutral-100 dark:bg-black dark:text-white dark:hover:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_white] transition-all uppercase">
                    Back to Home
                </Button>
            </Link>
        </div>
    );
}
