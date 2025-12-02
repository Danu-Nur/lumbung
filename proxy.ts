// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import createMiddleware from 'next-intl/middleware';

// Ambil helper `auth` dari NextAuth v5
const { auth } = NextAuth(authConfig);

// Intl middleware (next-intl)
const intlMiddleware = createMiddleware({
    locales: ['en', 'id'],
    defaultLocale: 'id'
});

// Semua path yang harus pakai login
const PROTECTED_PATHS = [
    '/dashboard',
    '/inventory',
    '/warehouses',
    '/sales-orders',
    '/purchase-orders',
    '/transfers',
    '/adjustments',
    '/customers',
    '/suppliers',
    '/settings'
];

function isProtectedRoute(pathname: string): boolean {
    // Normalize: buang prefix locale /en /id kalau ada
    const localeMatch = pathname.match(/^\/(en|id)(\/.*)?$/);
    if (localeMatch) {
        pathname = localeMatch[2] || '/';
    }

    return PROTECTED_PATHS.some(
        (base) => pathname === base || pathname.startsWith(`${base}/`)
    );
}

// ⬇️ Ini yang akan dipanggil Next.js sebagai middleware
export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Cek perlu proteksi atau tidak
    if (isProtectedRoute(pathname)) {
        const session = await auth();

        if (!session?.user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Tetap jalankan i18n routing dari next-intl
    return intlMiddleware(request);
}

// Scope middleware ke semua halaman (kecuali api, _next, file statis)
export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
