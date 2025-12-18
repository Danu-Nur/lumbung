import { InfiniteMovingLogos } from "@/components/ui/infinite-moving-logos";
import { useTranslations } from "next-intl";
import { Badge } from "../ui/badge";

export function MarketingPartners() {
    const t = useTranslations("Landing.partners");

    return (
        <section
            id="partners"
            className="container py-8 md:py-16 mx-auto"
        >
            <div className="text-center text-sm font-medium text-muted-foreground mb-6">
                <Badge variant="outline" className="rounded-none px-4 py-1.5 text-sm border-2 border-black dark:border-white/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer backdrop-blur-sm dark:text-white">
                    {t("trustedBy")}
                </Badge>
            </div>
            <div className="mx-auto w-full overflow-hidden">
                <InfiniteMovingLogos
                    items={[
                        // Logo 1: TechBolt
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="1">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500 fill-current"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">TechBolt</span>
                        </div>,
                        // Logo 2: CircleSphere
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="2">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-500 stroke-current stroke-2"><circle cx="12" cy="12" r="10" /><path d="M8 12L12 16L16 8" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">CircleSphere</span>
                        </div>,
                        // Logo 3: BoxStack
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="3">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-orange-500 stroke-current stroke-2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3V21" /><path d="M3 9H21" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">BoxStack</span>
                        </div>,
                        // Logo 4: CloudNine
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="4">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-sky-400 fill-current"><path d="M17 19C19.7614 19 22 16.7614 22 14C22 11.2386 19.7614 9 17 9H16.8203C16.486 6.13685 14.1509 4 11.5 4C8.46243 4 6 6.46243 6 9.5C6 9.58 6.002 9.66 6.006 9.74C3.766 10.32 2 12.33 2 14.75C2 17.65 4.35 20 7.25 20H17V19Z" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">CloudNine</span>
                        </div>,
                        // Logo 5: HexaGuard
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="5">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-green-500 stroke-current stroke-2"><path d="M12 2L2 7L12 12L22 7L12 2Z" /><path d="M2 17L12 22L22 17" /><path d="M2 12L12 17L22 12" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">HexaGuard</span>
                        </div>,
                        // Logo 6: InfiniteLoop
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="6">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-500 stroke-current stroke-2"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12ZM12 12C9.23858 12 7 14.2386 7 17C7 19.7614 9.23858 22 12 22C14.7614 22 17 19.7614 17 17C17 14.2386 14.7614 12 12 12Z" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">InfiniteLoop</span>
                        </div>,
                        // Logo 7: PulseWave
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="7">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-pink-500 stroke-current stroke-2"><path d="M3 12H6L9 3L15 21L18 12H21" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">PulseWave</span>
                        </div>,
                        // Logo 8: ShieldSafe
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="8">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-emerald-500 stroke-current stroke-2"><path d="M12 22S20 18 22 12V5L12 2L2 5V12C4 18 12 22 12 22Z" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">ShieldSafe</span>
                        </div>,
                        // Logo 9: NovaStar
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="9">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-yellow-500 fill-current"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">NovaStar</span>
                        </div>,
                        // Logo 10: CyberCore
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" key="10">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-cyan-500 stroke-current stroke-2"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M12 8V16" /><path d="M8 12H16" /></svg>
                            <span className="font-bold text-xl text-black dark:text-white">CyberCore</span>
                        </div>
                    ]}
                    direction="left"
                    speed="normal"
                />
            </div>
        </section>
    );
}
