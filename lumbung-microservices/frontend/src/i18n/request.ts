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

    // Pisah key yang mau dijadiin top-level tapi tetap preserve struktur lama
    const { help, Footer, ...common } = commonRaw;

    // charts tetap di bawah namespace dashboard (bukan top-level)
    const { charts, ...dashboard } = dashboardRaw;

    // Beberapa bagian inventory dijadikan namespace sendiri
    const {
        categories,
        warehouses,
        transfers,
        adjustments,
        opname,
        ...inventory
    } = inventoryRaw;

    const messages = {
        // common & turunannya
        common,
        help,
        Footer,

        // auth namespace → t('auth.login.title')
        auth: authRaw,

        // dashboard tetap satu namespace, charts di dalamnya
        dashboard: {
            ...dashboard,
            charts
        },

        // inventory namespace + sub-namespace sesuai kebutuhan
        inventory,
        categories,
        warehouses,
        transfers,
        adjustments,
        opname,

        // sales & purchases per-domain
        sales: salesRaw,
        purchases: purchasesRaw,

        // partners.json & marketing.json di-*spread* ke top-level
        // misal: suppliers, customers, landing, pricing, about, dll.
        ...partnersRaw,
        ...marketingRaw
    };

    return {
        locale,
        messages
    };
});
