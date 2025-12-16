'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface InventoryContentWrapperProps {
    children: React.ReactNode;
    viewKey: string;
}

export function InventoryContentWrapper({ children, viewKey }: InventoryContentWrapperProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={viewKey}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
