import NextAuth from 'next-auth';
import createMiddleware from 'next-intl/middleware';
import { authConfig } from './lib/auth.config';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);

const publicPages = [
    '/',
    '/login',
    '/register',
    '/about',
    '/pricing',
    '/contact',
    '/docs',
    '/api/auth/signin', // Important for auth flow
];

const authPages = ['/login', '/register'];

export const proxy = auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Check if the current path is public
    const pathWithoutLocale = nextUrl.pathname.replace(/^\/(en|id)/, '') || '/';

    const isPublic = publicPages.includes(pathWithoutLocale) ||
        publicPages.some(p => p !== '/' && pathWithoutLocale.startsWith(p));

    const isAuthPage = authPages.includes(pathWithoutLocale);

    if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
    }

    if (!isPublic && !isLoggedIn) {
        const locale = nextUrl.pathname.match(/^\/(en|id)/)?.[1] || routing.defaultLocale;
        const loginUrl = new URL(`/${locale}/login`, nextUrl);
        return Response.redirect(loginUrl);
    }

    return intlMiddleware(req);
});

export const config = {
    // Skip all internal paths
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
