import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export async function proxy(request: NextRequest) {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
        // Redirect to login if not authenticated
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Protect dashboard routes
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/inventory/:path*',
        '/warehouses/:path*',
        '/sales-orders/:path*',
        '/purchase-orders/:path*',
        '/transfers/:path*',
        '/adjustments/:path*',
        '/customers/:path*',
        '/suppliers/:path*',
        '/settings/:path*',
    ],
};
