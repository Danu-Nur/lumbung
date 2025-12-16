'use client';

import { useState, ReactNode } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { CrudModal } from '@/components/common/CrudModal';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

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
    };

    return (
        <CrudModal
            open={open}
            onOpenChange={setOpen}
            trigger={trigger}
            title={title}
            description={description}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-1">
                    {children}
                    <DialogFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? submittingLabel : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </CrudModal>
    );
}
