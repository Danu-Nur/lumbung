'use client'

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
    User as UserIcon,
} from 'lucide-react'

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/providers/auth-provider'
import { useTranslations } from 'next-intl'

export function NavUser() {
    const { user, logout } = useAuth()
    const t = useTranslations('common.topbar')

    if (!user) return null

    // Get initials for fallback
    const initials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-all border-2 border-transparent hover:border-black group text-left outline-none">
                    <Avatar className="h-9 w-9 border-2 border-black">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.email} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-foreground truncate">{user.email.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-hover:text-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56 rounded-none border-2 border-black p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_white]"
                side="right"
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
                        <Avatar className="h-8 w-8 border-2 border-black">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.email} />
                            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-bold">{user.email.split('@')[0]}</span>
                            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black h-[2px]" />
                <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem className="rounded-none hover:bg-muted cursor-pointer font-medium focus:bg-muted gap-2">
                        <Sparkles className="size-4" />
                        {t('upgrade')}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-black h-[2px]" />
                <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem className="rounded-none hover:bg-muted cursor-pointer font-medium focus:bg-muted gap-2">
                        <BadgeCheck className="size-4" />
                        {t('account')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-none hover:bg-muted cursor-pointer font-medium focus:bg-muted gap-2">
                        <CreditCard className="size-4" />
                        {t('billing')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-none hover:bg-muted cursor-pointer font-medium focus:bg-muted gap-2">
                        <Bell className="size-4" />
                        {t('notifications')}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-black h-[2px]" />
                <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem
                        onClick={() => logout()}
                        className="rounded-none hover:bg-destructive/10 text-destructive cursor-pointer font-bold focus:bg-destructive/10 gap-2"
                    >
                        <LogOut className="size-4" />
                        {t('logout')}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
