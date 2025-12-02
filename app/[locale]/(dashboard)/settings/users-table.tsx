'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserDialog } from './user-dialog';
import { toggleUserStatus, updateUserRole } from '@/features/settings/actions';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface UsersTableProps {
    users: any[];
    roles: any[];
    canManageUsers: boolean;
}

export function UsersTable({ users, roles, canManageUsers }: UsersTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const router = useRouter();

    const handleRoleChange = async (userId: string, roleId: string) => {
        setLoadingId(userId);
        try {
            await updateUserRole(userId, roleId);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to update user role');
        } finally {
            setLoadingId(null);
        }
    };

    const handleStatusToggle = async (userId: string) => {
        setLoadingId(userId);
        try {
            await toggleUserStatus(userId);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to update user status');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Team Members</span>
                    </CardTitle>
                    {canManageUsers && <UserDialog roles={roles} />}
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Email</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Role</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Status</th>
                                {canManageUsers && <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                        {canManageUsers ? (
                                            <select
                                                value={user.roleId}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="bg-transparent border-none focus:ring-0 cursor-pointer disabled:opacity-50"
                                                disabled={loadingId === user.id}
                                            >
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            user.role.name
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    {canManageUsers && (
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusToggle(user.id)}
                                                disabled={loadingId === user.id}
                                                className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                                            >
                                                {loadingId === user.id ? '...' : (user.isActive ? 'Deactivate' : 'Activate')}
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

