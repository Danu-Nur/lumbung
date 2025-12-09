"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function FormDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    maxWidth = "max-w-4xl",
}: FormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${maxWidth} max-h-[90vh] flex flex-col p-0 gap-0`}>
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <ScrollArea className="flex-1 p-6">
                    {children}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
