import { InfiniteMovingLogos } from "@/components/ui/infinite-moving-logos";
import { useTranslations } from "next-intl";

export function MarketingPartners() {
    const t = useTranslations("Landing.partners");

    return (
        <section
            id="partners"
            className="container py-8 md:py-16 mx-auto dark:border-white"
        >
            <div className="text-center mb-10">
                <div className="inline-block bg-white dark:bg-black border-2 border-black dark:border-white px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] transform -rotate-1">
                    <span className="text-sm font-black uppercase tracking-widest text-black dark:text-white">
                        {t("trustedBy")}
                    </span>
                </div>
            </div>
            <div className="mx-auto w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-y-2 border-black dark:border-white py-6">
                <InfiniteMovingLogos
                    items={[
                        // Logo 1: TechBolt
                        <div className="flex items-center gap-3 px-8" key="1">
                            <div className="w-10 h-10 bg-blue-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white fill-current"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" /></svg>
                            </div>
                            <span className="font-black text-xl text-black dark:text-white uppercase">TechBolt</span>
                        </div>,
                        // Logo 2: CircleSphere
                        <div className="flex items-center gap-3 px-8" key="2">
                            <div className="w-10 h-10 bg-purple-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white stroke-current stroke-2"><circle cx="12" cy="12" r="10" /><path d="M8 12L12 16L16 8" /></svg>
                            </div>
                            <span className="font-black text-xl text-black dark:text-white uppercase">CircleSphere</span>
                        </div>,
                        // Logo 3: BoxStack
                        <div className="flex items-center gap-3 px-8" key="3">
                            <div className="w-10 h-10 bg-orange-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white stroke-current stroke-2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3V21" /><path d="M3 9H21" /></svg>
                            </div>
                            <span className="font-black text-xl text-black dark:text-white uppercase">BoxStack</span>
                        </div>,
                        // Logo 4: CloudNine
                        <div className="flex items-center gap-3 px-8" key="4">
                            <div className="w-10 h-10 bg-sky-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white fill-current"><path d="M17 19C19.7614 19 22 16.7614 22 14C22 11.2386 19.7614 9 17 9H16.8203C16.486 6.13685 14.1509 4 11.5 4C8.46243 4 6 6.46243 6 9.5C6 9.58 6.002 9.66 6.006 9.74C3.766 10.32 2 12.33 2 14.75C2 17.65 4.35 20 7.25 20H17V19Z" /></svg>
                            </div>
                            <span className="font-black text-xl text-black dark:text-white uppercase">CloudNine</span>
                        </div>,
                        // Logo 5: HexaGuard
                        <div className="flex items-center gap-3 px-8" key="5">
                            <div className="w-10 h-10 bg-green-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white stroke-current stroke-2"><path d="M12 2L2 7L12 12L22 7L12 2Z" /><path d="M2 17L12 22L22 17" /><path d="M2 12L12 17L22 12" /></svg>
                            </div>
                            <span className="font-black text-xl text-black dark:text-white uppercase">HexaGuard</span>
                        </div>,
                        // Logo 6: InfiniteLoop
                        <div className="flex items-center gap-3 px-8" key="6">
                            <div className="w-10 h-10 bg-red-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white stroke-current stroke-2"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12ZM12 12C9.23858 12 7 14.2386 7 17C7 19.7614 9.23858 22 12 22C14.7614 22 17 19.7614 17 17C17 14.2386 14.7614 12 12 12Z" /></svg>
                            </div>
                            <span className="font-black text-xl text-black dark:text-white uppercase">InfiniteLoop</span>
                        </div>
                    ]}
                    direction="left"
                    speed="normal"
                />
            </div>
        </section>
    );
}
