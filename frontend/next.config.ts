import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withPWA = withPWAInit({
    dest: "public",
    disable: false, // Enabled for testing
    register: true,
    workboxOptions: {
        skipWaiting: true,
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone' as const,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default withPWA(withNextIntl(nextConfig));
