'use client';

import { useState, ReactNode } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

interface DialogFormProps<T extends FieldValues> {
    trigger?: ReactNode;
    title: string;
    description?: string;
    form: UseFormReturn<T>;
    onSubmit: (values: T) => Promise<void>;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    submitLabel?: string;
    submittingLabel?: string;
}

export function DialogForm<T extends FieldValues>({
    trigger,
    title,
    description,
    form,
    onSubmit,
    children,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    submitLabel = 'Save',
    submittingLabel = 'Saving...',
}: DialogFormProps<T>) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const handleSubmit = async (values: T) => {
        await onSubmit(values);
        // We don't automatically close here because the parent might want to keep it open on error
        // But typically we close on success. 
        // For now, let the parent handle closing via onOpenChange or let's assume parent handles logic.
        // Actually, the parent usually resets form and closes dialog.
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        {children}
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? submittingLabel : submitLabel}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
