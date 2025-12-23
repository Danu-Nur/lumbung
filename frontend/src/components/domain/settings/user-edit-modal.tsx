"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { updateUserRole } from '@/features/settings/actions';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/sonner';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
    roleId: z.string().min(1, "Role is required"),
});

import { UserWithRole } from "@/types/serialized";

interface UserEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserWithRole;
    roles: { id: string; name: string }[];
    onSuccess?: () => void;
}

export function UserEditModal({ open, onOpenChange, user, roles, onSuccess }: UserEditModalProps) {
    const router = useRouter();
    const t = useTranslations('settings.users');
    const tCommon = useTranslations('common');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roleId: '',
        },
    });

    useEffect(() => {
        if (open && user) {
            form.reset({
                roleId: user.roleId,
            });
        }
    }, [open, user, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return;
        try {
            await updateUserRole(user.id, values.roleId);
            toast.success('User role updated successfully');
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to update user role');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('editRole')}</DialogTitle>
                    <DialogDescription>
                        Change the role for {user?.name}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="roleId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('role')}</FormLabel>
                                    <select
                                        {...field}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">{t('selectRole')}</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {tCommon('buttons.cancel')}
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? t('saving') : tCommon('buttons.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
