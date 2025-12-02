'use client';

import { HelpSheet } from './help-sheet';

interface PageHeaderProps {
    title: string;
    description?: string;
    help?: React.ReactNode;
    children?: React.ReactNode; // Actions
}

export function PageHeader({ title, description, help, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {help && <HelpSheet title={title}>{help}</HelpSheet>}
                </div>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    );
}
