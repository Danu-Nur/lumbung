// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

// ✅ Halaman publik (tanpa login)
const PUBLIC_PATHS = [
    '/',
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

function stripLocale(pathname: string): string {
    const match = pathname.match(/^\/(en|id)(\/.*)?$/);
    return match ? (match[2] || '/') : pathname;
}

function isProtectedRoute(pathname: string): boolean {
    const path = stripLocale(pathname);
    return PROTECTED_PATHS.some(
        (base) => path === base || path.startsWith(`${base}/`)
    );
}

export default function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // 1️⃣ Run intl middleware first to handle locale redirection and rewriting
    // We capture the response to potentially modify it or return it directly
    const response = intlMiddleware(request);

    // 2️⃣ Check Protected Routes
    if (isProtectedRoute(pathname)) {
        // Check for 'token' cookie set by the backend
        const token = request.cookies.get('token');

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname + search);
            return NextResponse.redirect(loginUrl);
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
