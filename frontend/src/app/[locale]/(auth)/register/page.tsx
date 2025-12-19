import { Package } from 'lucide-react';
import { RegisterForm } from './register-form';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { BrandLogo } from '@/components/layout/brand-logo';



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'auth.register' });
    return {
        title: `${t('title')} - Inventory Pro`,
        description: t('description'),
    };
}

export default function RegisterPage() {
    const t = useTranslations('auth.register');

    return (
        <div className="w-full max-w-[550px] bg-card border rounded-xl  border-2 border-border shadow-[5px_5px_0px_0px_var(--brutal-shadow)]">
            <div className="p-6 sm:p-8 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <BrandLogo disabled={true} />

                    <div className="space-y-1 ">
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