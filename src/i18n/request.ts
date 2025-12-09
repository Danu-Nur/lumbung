import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !['en', 'id'].includes(locale)) {
        locale = 'id';
    }

    const commonModule = (await import(`@/lang/${locale}/common.json`)).default;
    const authModule = (await import(`@/lang/${locale}/auth.json`)).default;
    const dashboardModule = (await import(`@/lang/${locale}/dashboard.json`)).default;
    const inventoryModule = (await import(`@/lang/${locale}/inventory.json`)).default;
    const salesModule = (await import(`@/lang/${locale}/sales.json`)).default;
    const purchasesModule = (await import(`@/lang/${locale}/purchases.json`)).default;
    const marketingModule = (await import(`@/lang/${locale}/marketing.json`)).default;
    const partnersModule = (await import(`@/lang/${locale}/partners.json`)).default;

    // Destructure to restore original top-level keys
    const { help, Footer, ...common } = commonModule;
    const { charts, ...dashboard } = dashboardModule;
    const { categories, warehouses, transfers, adjustments, opname, ...inventory } = inventoryModule;

    // Combine into a single messages object matching the original structure
    const messages = {
        common,
        help,
        Footer,
        auth: authModule, // New namespace, accessible via t('auth.login')
        dashboard,
        charts,
        inventory,
        categories,
        warehouses,
        transfers,
        adjustments,
        opname,
        sales: salesModule,
        purchases: purchasesModule,
        ...partnersModule, // suppliers, customers
        ...marketingModule // Landing, Pricing, About
    };

    return {
        locale,
        messages
    };
});
