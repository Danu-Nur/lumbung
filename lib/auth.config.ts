import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.roleId = user.roleId;
                token.roleName = user.roleName;
                token.organizationId = user.organizationId;
                token.organizationName = user.organizationName;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.roleId = token.roleId as string;
                session.user.roleName = token.roleName as string;
                session.user.organizationId = token.organizationId as string | null;
                session.user.organizationName = token.organizationName as string | null;
            }
            return session;
        },
    },
    providers: [], // Providers added in auth.ts
    secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
