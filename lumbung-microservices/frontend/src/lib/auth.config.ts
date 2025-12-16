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

        // ⬇️ Bagian penting: bersihin ?callbackUrl dari /login
        async redirect({ url, baseUrl }) {
            // Support URL relatif & absolut
            const target = new URL(url, baseUrl);

            // Kalau mau redirect ke /login (dengan atau tanpa query)
            // kita paksa jadi /login polos, tanpa query string
            if (target.pathname === '/login') {
                target.search = ''; // hapus semua ?...
                return target.toString();
            }

            // Redirect lain: tetap ikuti default behaviour NextAuth
            // (hanya ijinkan redirect ke origin yang sama)
            if (target.origin === baseUrl) {
                return target.toString();
            }

            return baseUrl;
        },
    },
    providers: [], // Providers added in auth.ts
    secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
