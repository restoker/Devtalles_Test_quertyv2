'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { cn } from '@/lib/utils'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger
} from '@/components/ui/sidebar'
import { HugeiconsIcon } from "@hugeicons/react"
import {
    ChartNoAxesCombinedIcon,
    CrownIcon,
    Folder01Icon,
    Home01Icon,
    Route01Icon,
    SecurityCheckIcon,
    SourceCodeIcon,
    Sparkles,
    TaskDaily01Icon,
    User02Icon,
    UserMultiple03Icon,
} from "@hugeicons/core-free-icons"
import AnimatedLogo from '@/components/AnimatedLogo'

export type UserRole = 'admin' | 'user' | 'client'

export interface NavItem {
    title: string
    href: string
    icon: React.ComponentProps<typeof HugeiconsIcon>['icon']
    badge?: string | number
    badgeColor?: string
}

export interface NavGroup {
    label?: string
    items: NavItem[]
}

// ==========================================
// 1. NAVEGACIÓN PARA USUARIO ADMINISTRADOR
// ==========================================
export const adminNavGroups: NavGroup[] = [
    {
        items: [
            {
                title: 'Dashboard General',
                href: '/admin',
                icon: ChartNoAxesCombinedIcon,
                badge: 5,
                badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold',
            },
            // {
            //     title: 'Monitoreo en Tiempo Real',
            //     href: '/admin/real-time',
            //     icon: Activity03Icon,
            // },
        ],
    },
    {
        label: 'Gestión y Control',
        items: [
            {
                title: 'Gestión de Usuarios',
                href: '/admin/users',
                icon: UserMultiple03Icon,
                badge: '12',
                badgeColor: 'bg-primary/10 text-primary font-medium',
            },
            {
                title: 'Roles y Seguridad',
                href: '/admin/roles',
                icon: SecurityCheckIcon,
                badge: 'En curso',
                badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium',
            },
            {
                title: 'Categorias',
                href: '/admin/categorias',
                icon: Folder01Icon,
            },
            {
                title: 'Tecnologías',
                href: '/admin/technologies',
                icon: SourceCodeIcon,
            },
            {
                title: 'Cursos',
                href: '/admin/cursos',
                icon: CrownIcon,
            },
            {
                title: 'Roadmaps',
                href: '/admin/roadmaps',
                icon: Sparkles,
            },
            {
                title: 'Cuestionarios',
                href: '/admin/questionnaires',
                icon: TaskDaily01Icon,
            },
        ],
    },
    {
        label: 'Cuenta',
        items: [
            {
                title: 'Mi perfil',
                href: '/admin/profile',
                icon: User02Icon,
            },
        ],
    },
    // {
    //     label: 'Analíticas y Rendimiento',
    //     items: [
    //         {
    //             title: 'Content Performance',
    //             href: '/admin/content',
    //             icon: ChartLineData01Icon,
    //         },
    //         {
    //             title: 'Audience Insight',
    //             href: '/admin/audience',
    //             icon: UserMultiple03Icon,
    //         },
    //         {
    //             title: 'Engagement Metrics',
    //             href: '/admin/engagement',
    //             icon: PieChartIcon,
    //         },
    //         {
    //             title: 'Hashtag Performance',
    //             href: '/admin/hashtags',
    //             icon: HashtagIcon,
    //             badge: 3,
    //             badgeColor: 'bg-primary/10 text-primary',
    //         },
    //         {
    //             title: 'Competitor Analysis',
    //             href: '/admin/competitor',
    //             icon: ArrowLeftRightIcon,
    //         },
    //         {
    //             title: 'Sentiment Tracking',
    //             href: '/admin/sentiment',
    //             icon: TaskDaily01Icon,
    //         },
    //     ],
    // },
    // {
    //     label: 'Sistema y Configuración',
    //     items: [
    //         {
    //             title: 'Calendario Global',
    //             href: '/admin/calendar',
    //             icon: Calendar01Icon,
    //         },
    //         {
    //             title: 'Reportes y Auditoría',
    //             href: '/admin/reports',
    //             icon: Undo03Icon,
    //         },
    //         {
    //             title: 'Configuración del Sistema',
    //             href: '/admin/settings',
    //             icon: SettingsIcon,
    //         },
    //     ],
    // },
]

// ==========================================
// 2. NAVEGACIÓN PARA USUARIO NORMAL / CLIENTE
// ==========================================
export const userNavGroups: NavGroup[] = [
    {
        items: [
            {
                title: 'Dashboard',
                href: '/admin',
                icon: Home01Icon,
            },
        ],
    },
    {
        label: 'Roadmaps',
        items: [
            {
                title: 'Roadmaps globales',
                href: '/admin/roadmaps/globales',
                icon: Sparkles,
            },
            {
                title: 'Roadmaps',
                href: '/admin/roadmaps/mios',
                icon: Route01Icon,
            },
            // {
            //     title: 'Crear roadmap',
            //     href: '/admin/roadmaps/new',
            //     icon: Route01Icon,
            // },
            {
                title: 'Cuestionarios',
                href: '/admin/assessments',
                icon: TaskDaily01Icon,
            },
        ],
    },
    {
        label: 'Cuenta',
        items: [
            {
                title: 'Mi perfil',
                href: '/admin/profile',
                icon: User02Icon,
            },
        ],
    },
]

function navItemIsActive(href: string, pathname: string) {
    if (href === '/admin') return pathname === '/admin'
    if (href === '/admin/roadmaps') {
        return (
            pathname === '/admin/roadmaps' ||
            pathname === '/admin/roadmaps/new' ||
            /^\/admin\/roadmaps\/\d+/.test(pathname)
        )
    }
    if (href === '/admin/roadmaps/mios') {
        return pathname === href || /^\/admin\/roadmaps\/\d+/.test(pathname)
    }
    if (href === '/admin/roadmaps/new') return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
}

export interface SidebarAppProps {
    children: React.ReactNode
    role?: UserRole
}

const SidebarApp = ({
    children,
    role,
}: SidebarAppProps) => {
    const pathname = usePathname()

    const resolveRole = (r?: string | null): 'admin' | 'user' => {
        return r?.toLowerCase() === 'admin' ? 'admin' : 'user'
    }

    const [sessionUser, setSessionUser] = useState<Session['user'] | null>(null)
    const [sessionRole, setSessionRole] = useState<'admin' | 'user' | null>(null)

    useEffect(() => {
        let isMounted = true
        getSession().then((session) => {
            if (isMounted && session?.user) {
                setSessionUser(session.user)
                if (session.user.role) {
                    setSessionRole(resolveRole(session.user.role))
                }
            }
        })
        return () => {
            isMounted = false
        }
    }, [])

    // El rol se obtiene directamente de getSession() (o prop opcional 'role')
    const currentRole: 'admin' | 'user' = role ? resolveRole(role) : (sessionRole ?? 'user')

    const activeNavGroups = currentRole === 'admin' ? adminNavGroups : userNavGroups

    const displayName =
        [sessionUser?.name, sessionUser?.lastname].filter(Boolean).join(' ') ||
        sessionUser?.name ||
        (currentRole === 'admin' ? 'Administrador' : 'Usuario Normal')

    const displayEmail =
        sessionUser?.email ||
        (currentRole === 'admin' ? 'admin@devtalles.com' : 'usuario@devtalles.com')

    const initials =
        ((sessionUser?.name?.[0] || '') + (sessionUser?.lastname?.[0] || '')).toUpperCase() ||
        (currentRole === 'admin' ? 'AD' : 'US')

    return (
        <div className='flex h-dvh w-full min-w-0 overflow-hidden'>
            <SidebarProvider className='h-full min-h-0 min-w-0'>
                <Sidebar>
                    {/* Header del Sidebar con branding e indicador de rol único */}
                    <SidebarHeader className='border-sidebar-border border-b p-4'>
                        <div className='flex items-center justify-between'>
                            <div className='group flex items-center gap-2.5'>
                                <div className='flex min-w-0 flex-col'>
                                    <AnimatedLogo className='text-xl text-black dark:text-white' />
                                    <span className='text-muted-foreground truncate text-[11px]'>
                                        {currentRole === 'admin' ? 'Panel Admin' : 'Espacio de Usuario'}
                                    </span>
                                </div>
                            </div>
                            <span
                                className={cn(
                                    'rounded-full px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider',
                                    currentRole === 'admin'
                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                )}
                            >
                                {currentRole}
                            </span>
                        </div>
                    </SidebarHeader>

                    {/* Contenido de navegación determinado según el rol del usuario */}
                    <SidebarContent>
                        {activeNavGroups.map((group, groupIdx) => (
                            <SidebarGroup key={group.label || `group-${groupIdx}`}>
                                {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {group.items.map((item) => {
                                            const isActive = navItemIsActive(item.href, pathname)
                                            return (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        render={<Link href={item.href} />}
                                                        isActive={isActive}
                                                        tooltip={item.title}
                                                    >
                                                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                                                        <span>{item.title}</span>
                                                    </SidebarMenuButton>
                                                    {item.badge !== undefined && (
                                                        <SidebarMenuBadge
                                                            className={cn(
                                                                'top-1/2! right-2 -translate-y-1/2! rounded-full',
                                                                item.badgeColor || 'bg-primary/10'
                                                            )}
                                                        >
                                                            {item.badge}
                                                        </SidebarMenuBadge>
                                                    )}
                                                </SidebarMenuItem>
                                            )
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ))}
                    </SidebarContent>

                    {/* Footer del Sidebar con perfil de usuario y rol */}
                    <SidebarFooter className='border-sidebar-border border-t p-3'>
                        <div className='hover:bg-sidebar-accent/50 flex items-center gap-3 rounded-lg p-2 transition-colors'>
                            <div
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full font-bold text-xs',
                                    currentRole === 'admin'
                                        ? 'bg-purple-600/15 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                        : 'bg-emerald-600/15 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                )}
                            >
                                {initials}
                            </div>
                            <div className='flex min-w-0 flex-1 flex-col'>
                                <span className='text-sidebar-foreground truncate font-semibold text-xs'>
                                    {displayName}
                                </span>
                                <span className='text-muted-foreground truncate text-[11px]'>
                                    {displayEmail}
                                </span>
                            </div>
                            <Link
                                href='/'
                                title='Volver al inicio'
                                className='text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md p-1.5 transition-colors'
                            >
                                <HugeiconsIcon icon={Home01Icon} strokeWidth={2} className='size-4' />
                            </Link>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                {/* Estructura principal con barra superior */}
                <div className='flex h-full min-h-0 min-w-0 flex-1 flex-col'>
                    <header className='bg-card sticky top-0 z-50 flex h-13.75 shrink-0 items-center justify-between gap-4 border-b px-4 py-2 sm:px-6'>
                        <div className='flex items-center gap-3'>
                            <SidebarTrigger className='[&_svg]:size-5!' />
                            <div className='bg-border hidden h-4 w-px sm:block' />
                            <div className='flex items-center gap-2'>
                                <span className='text-foreground font-semibold text-xs sm:text-sm'>
                                    {currentRole === 'admin' ? 'Panel de Administración' : 'Panel de Usuario'}
                                </span>
                                <span
                                    className={cn(
                                        'hidden rounded-full px-2 py-0.5 font-medium text-[11px] sm:inline-flex',
                                        currentRole === 'admin'
                                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    )}
                                >
                                    {currentRole === 'admin' ? 'Administrador' : 'Usuario'}
                                </span>
                            </div>
                        </div>
                    </header>

                    <main
                        data-lenis-prevent
                        className='min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 sm:px-6'
                    >
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </div>
    )
}

export default SidebarApp