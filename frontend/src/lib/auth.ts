import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';
import { SignJWT } from 'jose';

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Google,
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    console.log("[Auth] Authorize called for:", credentials.email);

                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string },
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: {
                                            permission: true,
                                        },
                                    },
                                },
                            },
                            organization: true,
                        },
                    });

                    if (!user) {
                        console.log("[Auth] User not found");
                        return null;
                    }
                    if (!user.isActive) {
                        console.log("[Auth] User inactive");
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    console.log("[Auth] Password valid:", isPasswordValid);

                    if (!isPasswordValid) {
                        return null;
                    }

                    // Update last login
                    try {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { lastLoginAt: new Date() },
                        });
                    } catch (error) {
                        console.error("Failed to update last login", error);
                    }

                    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'supersecret');
                    const alg = 'HS256';

                    const accessToken = await new SignJWT({
                        id: user.id,
                        role: user.role.name,
                        organizationId: user.organizationId
                    })
                        .setProtectedHeader({ alg })
                        .setIssuedAt()
                        .setExpirationTime('24h')
                        .sign(secret);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        roleId: user.roleId,
                        roleName: user.role.name,
                        organizationId: user.organizationId,
                        organizationName: user.organization?.name || null,
                        accessToken,
                    };
                } catch (error) {
                    console.error("[Auth] Authorize error:", error);
                    return null;
                }
            },
        }),
    ],
});
