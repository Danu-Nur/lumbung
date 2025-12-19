import { getRequestConfig } from 'next-intl/server';

const SUPPORTED_LOCALES = ['en', 'id'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async ({ requestLocale }) => {
    // requestLocale is a Promise in next-intl v4+
    let locale = await requestLocale;

    if (!locale || !SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
        locale = 'id';
    }

    // Import semua module paralel biar cepet
    const [
        commonModule,
        authModule,
        dashboardModule,
        inventoryModule,
        salesModule,
        purchasesModule,
        marketingModule,
        partnersModule
    ] = await Promise.all([
        import(`@/lang/${locale}/common.json`),
        import(`@/lang/${locale}/auth.json`),
        import(`@/lang/${locale}/dashboard.json`),
        import(`@/lang/${locale}/inventory.json`),
        import(`@/lang/${locale}/sales.json`),
        import(`@/lang/${locale}/purchases.json`),
        import(`@/lang/${locale}/marketing.json`),
        import(`@/lang/${locale}/partners.json`)
    ]);

    const commonRaw = commonModule.default;
    const dashboardRaw = dashboardModule.default;
    const inventoryRaw = inventoryModule.default;
    const salesRaw = salesModule.default;
    const purchasesRaw = purchasesModule.default;
    const marketingRaw = marketingModule.default;
    const partnersRaw = partnersModule.default;
    const authRaw = authModule.default;

    // Preserve original structure but also allow flattened access where needed
    const messages = {
        // Full namespaces
        common: commonRaw,
        auth: authRaw,
        dashboard: dashboardRaw,
        inventory: inventoryRaw,
        sales: salesRaw,
        purchases: purchasesRaw,

        // Top-level aliases for convenience (if used by some components)
        help: commonRaw.help,
        Footer: commonRaw.Footer,
        categories: inventoryRaw.categories,
        warehouses: inventoryRaw.warehouses,
        transfers: inventoryRaw.transfers,
        adjustments: inventoryRaw.adjustments,
        opname: inventoryRaw.opname,

        // Spread partners and marketing as they are mostly flat domain lists
        ...partnersRaw,
        ...marketingRaw
    };

    return {
        locale,
        messages
    };
});
