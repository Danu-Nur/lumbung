'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hash } from 'bcryptjs';

const organizationSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export async function updateOrganization(formData: FormData) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    // Check if user is Admin or SuperAdmin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
    });

    if (user?.role.name !== 'SuperAdmin' && user?.role.name !== 'Admin') {
        throw new Error('Insufficient permissions');
    }

    const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
    };

    const validated = organizationSchema.parse(data);

    await prisma.organization.update({
        where: { id: session.user.organizationId },
        data: validated,
    });

    revalidatePath('/settings');
}

export async function inviteUser(formData: FormData) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
    });

    if (user?.role.name !== 'SuperAdmin' && user?.role.name !== 'Admin') {
        throw new Error('Insufficient permissions');
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const roleId = formData.get('roleId') as string;
    const password = formData.get('password') as string;

    const fs = require('fs');
    const logPath = 'c:\\laragon\\www\\lumbung\\debug.log';
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] InviteUser called\n`);

    if (!name || !email || !roleId || !password) {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Missing fields: ${JSON.stringify({ name, email, roleId, password })}\n`);
        throw new Error('Missing required fields');
    }

    fs.appendFileSync(logPath, `[${new Date().toISOString()}] Creating user: ${JSON.stringify({ name, email, roleId, orgId: session.user.organizationId })}\n`);

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            roleId,
            organizationId: session.user.organizationId,
        },
    });

    revalidatePath('/settings');
}

export async function updateUserRole(userId: string, roleId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
    });

    if (currentUser?.role.name !== 'SuperAdmin') {
        throw new Error('Only SuperAdmin can change roles');
    }

    await prisma.user.update({
        where: { id: userId },
        data: { roleId },
    });

    revalidatePath('/settings');
}

export async function toggleUserStatus(userId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
    });

    if (currentUser?.role.name !== 'SuperAdmin' && currentUser?.role.name !== 'Admin') {
        throw new Error('Insufficient permissions');
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!targetUser) throw new Error('User not found');

    // Prevent deactivating self
    if (targetUser.id === session.user.id) {
        throw new Error('Cannot deactivate yourself');
    }

    await prisma.user.update({
        where: { id: userId },
        data: { isActive: !targetUser.isActive },
    });

    revalidatePath('/settings');
}
