

import { PageHelp } from './page-help';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    help?: {
        title: string;
        children: ReactNode;
    };
    actions?: ReactNode;
}

export function PageHeader({ title, description, help, actions }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-foreground">
                        {title}
                    </h1>
                    {help && <PageHelp title={help.title}>{help.children}</PageHelp>}
                </div>
                {description && (
                    <p className="text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
        </div>
    );
}
