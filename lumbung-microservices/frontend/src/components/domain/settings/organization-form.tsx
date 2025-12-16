"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateOrganization } from '@/features/settings/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
});

interface OrganizationFormProps {
    initialData: {
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
    };
    canEdit: boolean;
}

export function OrganizationForm({ initialData, canEdit }: OrganizationFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const t = useTranslations('settings.organization');
    const tSection = useTranslations('settings.sections');
    const tCommon = useTranslations('common');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name,
            email: initialData.email || '',
            phone: initialData.phone || '',
            address: initialData.address || '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!canEdit) return;
        setLoading(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });
        try {
            await updateOrganization(formData);
            alert(t('saved'));
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message || t('failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>{tSection('organization')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('name')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={!canEdit} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('email')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={!canEdit} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('phone')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={!canEdit} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('address')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={!canEdit} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {canEdit && (
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    {loading ? tCommon('users.saving') : tCommon('buttons.save')}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
