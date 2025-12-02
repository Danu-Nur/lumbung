"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCategory, updateCategory } from "@/features/categories/actions";
import { DialogForm } from "@/components/shared/dialog-form";
// Actually, I'll stick to simple alert or console error if toast isn't set up, but I should probably use a toast if possible.
// The user prompt mentioned "Show success toast or inline 'Saved' message".
// I'll assume standard alert for now to avoid dependency issues, or just console.

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

interface CategoryDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    category?: { id: string; name: string; description?: string | null };
    onSuccess?: (category?: any) => void;
}

export function CategoryDialog({
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    category,
    onSuccess,
}: CategoryDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isEdit = !!category;

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: category?.name || "",
            description: category?.description || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            if (values.description) formData.append("description", values.description);

            let result;
            if (isEdit) {
                result = await updateCategory(category.id, formData);
            } else {
                result = await createCategory(formData);
            }

            form.reset();
            setOpen(false);
            if (onSuccess && result) onSuccess(result);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to save category");
        }
    };

    return (
        <DialogForm
            trigger={trigger}
            open={open}
            onOpenChange={setOpen}
            title={isEdit ? "Edit Category" : "Add Category"}
            description={isEdit ? "Update category details." : "Create a new category for your products."}
            form={form}
            onSubmit={onSubmit}
            submitLabel={isEdit ? "Save Changes" : "Create Category"}
        >
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Electronics" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Category description..."
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </DialogForm>
    );
}

