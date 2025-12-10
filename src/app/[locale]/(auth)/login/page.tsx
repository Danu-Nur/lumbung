import { Package } from 'lucide-react';
import { LoginForm } from './login-form';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

type Props = {
    params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'auth.login' });
    return {
        title: `${t('title')} - Inventory Pro`,
        description: t('description'),
    };
}

export default function LoginPage() {
    const t = useTranslations('auth.login');

    return (
        // Wrapper Utama: 
        // Tidak perlu 'min-h-screen' atau 'flex-center' lagi karena AuthLayout sudah menanganinya.
        // Kita kunci lebarnya di 450px agar terlihat padat dan rapi.
        <div className="w-full max-w-[450px] bg-card border rounded-xl shadow-lg">

            {/* Padding Card */}
            <div className="p-6 sm:p-8 space-y-8">

                {/* Bagian Header (Logo & Judul) */}
                <div className="flex flex-col items-center text-center space-y-2">
                    {/* Logo Box */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-2">
                        <Package className="h-6 w-6 text-primary-foreground" />
                    </div>

                    {/* Nama Brand */}
                    <span className="text-2xl font-bold">Inventory Pro</span>

                    {/* Sub-judul */}
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight">{t('subtitle')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('description')}
                        </p>
                    </div>
                </div>

                {/* Komponen Form Login (Input, Tombol, Demo, Link Register) */}
                <LoginForm />

            </div>
        </div>
    );
}