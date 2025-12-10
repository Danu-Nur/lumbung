import { Package } from 'lucide-react';
import { RegisterForm } from './register-form';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

type Props = {
    params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'auth.register' });
    return {
        title: `${t('title')} - Inventory Pro`,
        description: t('description'),
    };
}

export default function RegisterPage() {
    const t = useTranslations('auth.register');

    return (
        <div className="w-full max-w-[550px] bg-card border rounded-xl shadow-lg">
            <div className="p-6 sm:p-8 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-2">
                        <Package className="h-6 w-6 text-primary-foreground" />
                    </div>

                    <span className="text-2xl font-bold">Inventory Pro</span>

                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight">{t('subtitle')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('description')}
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <RegisterForm />

            </div>
        </div>
    );
}