"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleUserStatus } from '@/features/settings/actions';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ActionColumn } from '@/components/shared/action-column';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { UserWithRole } from "@/types/serialized";
import { Role } from "@prisma/client";

interface UsersTableProps {
    users: UserWithRole[];
    roles: Role[];
    canManageUsers: boolean;
}

export function UsersTable({ users, roles, canManageUsers }: UsersTableProps) {
    const router = useRouter();

    const t = useTranslations('settings.users');
    const tCommon = useTranslations('common');

    const handleStatusToggle = async (userId: string) => {
        try {
            await toggleUserStatus(userId);
            toast.success('User status updated');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to update user status');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>{t('invite')}</span>
                    </CardTitle>
                    {canManageUsers && (
                        <Link href="?modal=create">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                {t('invite')}
                            </Button>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">{tCommon('table.name')}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">{t('email')}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">{t('role')}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">{t('status')}</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">{tCommon('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                        {user.role.name}
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                            {user.isActive ? t('active') : t('inactive')}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <ActionColumn
                                            onView={() => router.push(`?modal=show&id=${user.id}`, { scroll: false })}
                                            onEdit={canManageUsers ? () => router.push(`?modal=edit&id=${user.id}`, { scroll: false }) : undefined}
                                            customActions={canManageUsers ? [
                                                {
                                                    label: user.isActive ? t('deactivate') : t('activate'),
                                                    onClick: () => handleStatusToggle(user.id),
                                                    variant: user.isActive ? 'destructive' : 'default',
                                                    icon: user.isActive ? <span className="text-xs font-bold">✕</span> : <span className="text-xs font-bold">✓</span>
                                                }
                                            ] : []}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
