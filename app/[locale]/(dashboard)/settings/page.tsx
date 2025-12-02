import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { OrganizationForm } from './organization-form';
import { UsersTable } from './users-table';

import { PageHelp } from '@/components/shared/page-help';
import { getTranslations } from 'next-intl/server';

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

async function getRoles() {
    return await prisma.role.findMany({
        orderBy: { name: 'asc' },
    });
}

export default async function SettingsPage() {
    const session = await auth();
    const t = await getTranslations('settings');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const [organization, users, roles, currentUser] = await Promise.all([
        getOrganization(session.user.organizationId),
        getUsers(session.user.organizationId),
        getRoles(),
        prisma.user.findUnique({
            where: { id: session.user.id },
            include: { role: true },
        }),
    ]);

    if (!organization) {
        redirect('/dashboard');
    }

    const isSuperAdmin = currentUser?.role.name === 'SuperAdmin';
    const isAdmin = currentUser?.role.name === 'Admin';
    const canEditOrg = isSuperAdmin || isAdmin;
    const canManageUsers = isSuperAdmin || isAdmin;


    const helpSections = [
        {
            heading: t('help.purpose.heading'),
            content: t('help.purpose.content'),
        },
        {
            heading: 'Hak Akses', // TODO: Add to translations
            content: (
                <>
                    <p>Sistem ini memiliki pembagian hak akses:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li><strong>SuperAdmin / Admin:</strong> Memiliki akses penuh untuk mengubah pengaturan dan menambah/menghapus user.</li>
                        <li><strong>User / Staff:</strong> Mungkin hanya bisa melihat pengaturan tanpa bisa mengubahnya (Read-only).</li>
                    </ul>
                    <p className="mt-2 text-sm italic">Jika tombol "Save Changes" tidak muncul atau input terkunci, berarti akun Anda tidak memiliki izin untuk mengubah data tersebut.</p>
                </>
            ),
        },
        {
            heading: 'Bagian Pengaturan', // TODO: Add to translations
            content: (
                <ul className="list-disc pl-4 space-y-2">
                    <li><strong>{t('sections.organization')}:</strong> Informasi dasar bengkel/toko Anda yang mungkin akan muncul di kop surat atau invoice.</li>
                    <li><strong>{t('sections.email')}:</strong> Mengatur kapan sistem harus mengirim email (misal: saat stok menipis).</li>
                    <li><strong>{t('sections.users')}:</strong> Daftar orang yang bisa login. Gunakan tombol "Invite User" untuk menambah staff baru.</li>
                </ul>
            ),
        },
        {
            heading: 'Peringatan', // TODO: Add to translations
            content: 'Berhati-hatilah saat menonaktifkan akun user atau mengubah data perusahaan. Pastikan perubahan penting sudah dikomunikasikan kepada tim Anda.',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {t('title')}
                    </h1>
                    <PageHelp title={t('help.title')} sections={helpSections} />
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {t('description')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organization Settings */}
                <OrganizationForm initialData={organization} canEdit={canEditOrg} />

                {/* Email Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Mail className="w-5 h-5" />
                            <span>{t('sections.email')}</span>
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
            <UsersTable users={users} roles={roles} canManageUsers={canManageUsers} />
        </div>
    );
}
