"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface CustomAction {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

interface ActionColumnProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    viewLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
    customActions?: CustomAction[];
}

export function ActionColumn({
    onView,
    onEdit,
    onDelete,
    viewLabel,
    editLabel,
    deleteLabel,
    customActions = [],
}: ActionColumnProps) {
    const t = useTranslations("common");

    return (
        <div className="flex items-center gap-2">
            <TooltipProvider>
                {customActions.map((action, index) => (
                    <Tooltip key={index}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={action.onClick}
                                className={`h-8 w-8 ${action.variant === 'destructive'
                                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {action.icon || <span className="text-xs font-bold">?</span>}
                                <span className="sr-only">{action.label}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{action.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}

                {onView && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onView}
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">{viewLabel || t("buttons.view")}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{viewLabel || t("buttons.view")}</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {onEdit && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onEdit}
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">{editLabel || t("buttons.edit")}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{editLabel || t("buttons.edit")}</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {onDelete && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onDelete}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">{deleteLabel || t("buttons.delete")}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{deleteLabel || t("buttons.delete")}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
        </div>
    );
}
