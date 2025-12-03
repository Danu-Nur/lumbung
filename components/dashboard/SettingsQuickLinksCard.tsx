import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Building, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SettingsQuickLinksCard() {
    const t = useTranslations('dashboard.widgets.settings');

    const links = [
        { href: '/settings', label: t('organization'), icon: Building },
        { href: '/settings', label: t('users'), icon: Users }, // Assuming users are in settings
        { href: '/settings', label: t('roles'), icon: Shield },
    ];

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="shrink-0 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span>{t('title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-2">
                <div className="grid grid-cols-1 gap-2">
                    {links.map((link) => (
                        <Button key={link.label} variant="outline" asChild className="justify-start h-auto py-2">
                            <Link href={link.href}>
                                <link.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span>{link.label}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
