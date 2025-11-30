import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Users, Building2, Mail } from 'lucide-react';

async function getOrganization(organizationId: string) {
    return await prisma.organization.findUnique({
        where: { id: organizationId },
    });
}

async function getUsers(organizationId: string) {
    return await prisma.user.findMany({
        where: { organizationId },
        include: {
            role: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const organization = await getOrganization(session.user.organizationId);
    const users = await getUsers(session.user.organizationId);

    if (!organization) {
        redirect('/dashboard');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Manage your organization and user settings
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organization Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Building2 className="w-5 h-5" />
                            <span>Organization Details</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Organization Name
                            </label>
                            <Input defaultValue={organization.name} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Email
                            </label>
                            <Input defaultValue={organization.email || ''} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Phone
                            </label>
                            <Input defaultValue={organization.phone || ''} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Address
                            </label>
                            <textarea
                                defaultValue={organization.address || ''}
                                disabled
                                rows={3}
                                className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Email Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Mail className="w-5 h-5" />
                            <span>Email Notifications</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                    Low Stock Alerts
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Get notified when stock is low
                                </p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                    Order Notifications
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Get notified about new orders
                                </p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                    Weekly Reports
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Receive weekly inventory reports
                                </p>
                            </div>
                            <input type="checkbox" className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>Team Members</span>
                        </CardTitle>
                        <Button size="sm">Invite User</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Name
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Email
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Role
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                                            {user.name}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                            {user.email}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                            {user.role.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
