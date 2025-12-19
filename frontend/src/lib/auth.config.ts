import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours (Enterprise standard: Force re-login daily)
        updateAge: 60 * 60, // Update session every 1 hour
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.roleId = (user as any).roleId;
                token.roleName = (user as any).roleName;
                token.organizationId = (user as any).organizationId;
                token.organizationName = (user as any).organizationName;
                token.accessToken = (user as any).accessToken;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).roleId = token.roleId as string;
                (session.user as any).roleName = token.roleName as string;
                (session.user as any).organizationId = token.organizationId as string | null;
                (session.user as any).organizationName = token.organizationName as string | null;
                (session.user as any).accessToken = token.accessToken as string;
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
    trustHost: true,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'supersecret-dev-key',
} satisfies NextAuthConfig;
