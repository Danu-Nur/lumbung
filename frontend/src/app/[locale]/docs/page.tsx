import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function DocsPage() {
    return (
        <div className="space-y-10">
            <div className="space-y-4">
                <h1 className="scroll-m-20 text-4xl font-black uppercase tracking-tight lg:text-5xl border-b-4 border-black dark:border-white pb-4 inline-block">
                    Introduction
                </h1>
                <p className="text-xl text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                    Welcome to the <strong>Lumbung</strong> documentation. Lumbung is an open-source warehouse management system designed for speed, reliability, and ease of use.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_white] bg-white dark:bg-black">
                    <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                        <span className="bg-yellow-300 dark:bg-yellow-600 px-2 border-2 border-black dark:border-white">01.</span>
                        Getting Started
                    </h3>
                    <p className="mb-6 text-neutral-600 dark:text-neutral-300 font-medium">
                        Learn how to install Lumbung on your local machine or deploy it to the cloud.
                    </p>
                    <Link href="/docs/installation">
                        <Button className="w-full font-bold border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_white] transition-all bg-white text-black hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white">
                            Installation Guide <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="p-6 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_white] bg-white dark:bg-black">
                    <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                        <span className="bg-cyan-300 dark:bg-cyan-600 px-2 border-2 border-black dark:border-white">02.</span>
                        Architecture
                    </h3>
                    <p className="mb-6 text-neutral-600 dark:text-neutral-300 font-medium">
                        Understand the core concepts, database schema, and microservices architecture.
                    </p>
                    <Link href="/docs/architecture">
                        <Button className="w-full font-bold border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_white] transition-all bg-white text-black hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white">
                            View Architecture <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tight border-b-4 border-black dark:border-white pb-2 inline-block">
                    Features
                </h2>
                <ul className="grid gap-4 md:grid-cols-2">
                    {[
                        "Multi-warehouse support",
                        "Real-time inventory tracking",
                        "Role-based access control",
                        "Automated stock alerts",
                        "Supplier management",
                        "Barcode scanning integration"
                    ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 p-3 border-2 border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white]">
                            <div className="h-3 w-3 bg-black dark:bg-white shrink-0" />
                            <span className="font-bold text-lg">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
