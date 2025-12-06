// middleware.ts / proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

// ✅ Halaman publik (tanpa login)
// sesuaikan dengan rute landing / marketing di app kamu
const PUBLIC_PATHS = [
    '/',              // landing baseurl
    '/login',
    '/register',
    '/pricing',
    '/about',
    '/features',
];

// 🔒 Halaman yang wajib login
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
    '/settings',
    '/superadmin',
];

// Helper: buang prefix locale /en /id
function stripLocale(pathname: string): string {
    const match = pathname.match(/^\/(en|id)(\/.*)?$/);
    return match ? (match[2] || '/') : pathname;
}

function isPublicRoute(pathname: string): boolean {
    const path = stripLocale(pathname);
    return PUBLIC_PATHS.some(
        (base) => path === base || path.startsWith(`${base}/`)
    );
}

function isProtectedRoute(pathname: string): boolean {
    const path = stripLocale(pathname);
    return PROTECTED_PATHS.some(
        (base) => path === base || path.startsWith(`${base}/`)
    );
}

export default async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // 1️⃣ Kalau route publik: langsung lewatin (cuma diproses i18n)
    if (isPublicRoute(pathname)) {
        return intlMiddleware(request);
    }

    // 2️⃣ Kalau route protected: cek session
    if (isProtectedRoute(pathname)) {
        const session = await auth();

        if (!session?.user) {
            const loginUrl = new URL('/login', request.url);
            // simpan full path sebagai callback (termasuk query)
            loginUrl.searchParams.set('callbackUrl', pathname + search);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 3️⃣ Selain itu, anggap route biasa (misalnya halaman publik lain yg belum kamu list)
    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
