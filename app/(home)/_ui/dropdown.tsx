'use client'

import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    User02Icon,
    SettingsIcon,
    CreditCardIcon,
    Notification01Icon,
    LogoutIcon,
} from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation'

export interface UserDropdownProps {
    session: Session
    className?: string
    onItemClick?: () => void
}

export const UserDropdown = ({ session, className = '', onItemClick }: UserDropdownProps) => {
    const user = session.user
    const router = useRouter();
    const fullName = [user?.name, user?.lastname].filter(Boolean).join(' ') || user?.name || user?.email || 'Usuario'
    const initials = (
        (user?.name?.[0] || '') + (user?.lastname?.[0] || user?.name?.[1] || '')
    ).toUpperCase() || 'U'

    const handleSignOut = async () => {
        onItemClick?.()
        await signOut({ callbackUrl: '/login' })
    }

    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant='ghost'
                            size='icon'
                            className='size-9 rounded-full ring-2 ring-purple-600/20 hover:ring-purple-600/50 dark:ring-white/20 dark:hover:ring-white/40 transition-all duration-150 p-0 overflow-hidden cursor-pointer'
                        >
                            <Avatar className='size-full'>
                                {user?.image ? (
                                    <AvatarImage src={user.image} alt={fullName} />
                                ) : null}
                                <AvatarFallback className='text-xs font-semibold bg-purple-600/15 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200'>
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    }
                />
                <DropdownMenuContent align='end' className='w-60'>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className='flex flex-col gap-0.5 px-3 py-2.5'>
                            <span className='text-xs font-semibold text-foreground truncate'>
                                {fullName}
                            </span>
                            {user?.email && (
                                <span className='text-xs text-muted-foreground truncate font-normal'>
                                    {user.email}
                                </span>
                            )}
                            {user?.role && (
                                <span className='inline-block mt-1 w-fit rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400 capitalize'>
                                    {user.role}
                                </span>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className='*:[svg]:text-muted-foreground cursor-pointer'
                            onClick={() => {
                                onItemClick?.()
                                router.push('/profile')
                            }}
                        >
                            <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
                            <span className='text-popover-foreground'>Mi perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className='*:[svg]:text-muted-foreground cursor-pointer'
                            onClick={() => onItemClick?.()}
                        >
                            <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
                            <span className='text-popover-foreground'>Configuración</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className='*:[svg]:text-muted-foreground cursor-pointer'
                            onClick={() => {
                                onItemClick?.()
                                router.push('/admin')
                            }}
                        >
                            <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />
                            <span className='text-popover-foreground'>Panel</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className='*:[svg]:text-muted-foreground cursor-pointer'
                            onClick={() => onItemClick?.()}
                        >
                            <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} />
                            <span className='text-popover-foreground'>Notificaciones</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant='destructive'
                            className='cursor-pointer text-destructive focus:text-destructive'
                            onClick={handleSignOut}
                        >
                            <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
                            <span>Cerrar sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default UserDropdown
