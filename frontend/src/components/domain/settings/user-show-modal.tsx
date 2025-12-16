"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { useTranslations } from 'next-intl';

import { UserWithRole } from "@/types/serialized";

interface UserShowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserWithRole;
}

export function UserShowModal({ open, onOpenChange, user }: UserShowModalProps) {
    const t = useTranslations('settings.users');
    const tCommon = useTranslations('common');

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription>
                        View user information and role.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{tCommon('table.name')}</label>
                            <p className="text-base font-medium mt-1">{user.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
                            <p className="text-base font-medium mt-1">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t('role')}</label>
                            <p className="text-base font-medium mt-1">{user.role.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t('status')}</label>
                            <div className="mt-1">
                                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                    {user.isActive ? t('active') : t('inactive')}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{tCommon('table.date')}</label>
                            <p className="text-base font-medium mt-1">{formatDateTime(user.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
