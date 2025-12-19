'use client';

import { Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
    message?: string;
    fullPage?: boolean;
}

export function LoadingState({ message = 'Loading data...', fullPage = false }: LoadingStateProps) {
    const content = (
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="relative">
                {/* Shadow box */}
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 border-2 border-black" />

                {/* Main box */}
                <motion.div
                    className="relative bg-yellow-400 border-2 border-black p-6 z-10"
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Package className="w-12 h-12 text-black" />
                </motion.div>
            </div>

            <div className="relative inline-block">
                <div className="absolute inset-0 bg-yellow-400 translate-x-1 translate-y-1 -z-10 border border-black" />
                <p className="bg-white border-2 border-black px-4 py-1 font-bold text-black uppercase tracking-tight text-sm">
                    {message}
                </p>
            </div>

            {/* Progress bar placeholder animation */}
            <div className="w-48 h-4 border-2 border-black bg-white relative overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-black"
                    animate={{
                        left: ['-100%', '100%'],
                        width: ['20%', '50%', '20%']
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
}
