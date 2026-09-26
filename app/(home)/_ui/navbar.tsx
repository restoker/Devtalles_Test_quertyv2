'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import DrawSVGPlugin from 'gsap/DrawSVGPlugin'
import AnimatedLogo from '@/components/AnimatedLogo'
import { getSession, signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { authenticatedHome } from '@/lib/auth-routes'
import UserDropdown from './dropdown'

export const navigationFor = (session: Session | null) => {
    const home = session?.user ? authenticatedHome(session.user.role) : null
    const isAdmin = session?.user?.role?.toLowerCase() === 'admin'

    return [
        { name: 'Mi perfil', href: session?.user ? '/profile' : '/login' },
        { name: 'Features', href: '/#features' },
        { name: 'Marketplace', href: isAdmin ? '/admin/cursos' : (home ?? '/login') },
    ]
}

const svgVariants = [
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 24.2592C26.233 20.2879 47.7083 16.9968 69.135 13.8421C98.0469 9.5853 128.407 4.02322 158.059 5.14674C172.583 5.69708 187.686 8.66104 201.598 11.9696C207.232 13.3093 215.437 14.9471 220.137 18.3619C224.401 21.4596 220.737 25.6575 217.184 27.6168C208.309 32.5097 197.199 34.281 186.698 34.8486C183.159 35.0399 147.197 36.2657 155.105 26.5837C158.11 22.9053 162.993 20.6229 167.764 18.7924C178.386 14.7164 190.115 12.1115 201.624 10.3984C218.367 7.90626 235.528 7.06127 252.521 7.49276C258.455 7.64343 264.389 7.92791 270.295 8.41825C280.321 9.25056 296 10.8932 305 13.0242" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 29.5014C9.61174 24.4515 12.9521 17.9873 20.9532 17.5292C23.7742 17.3676 27.0987 17.7897 29.6575 19.0014C33.2644 20.7093 35.6481 24.0004 39.4178 25.5014C48.3911 29.0744 55.7503 25.7731 63.3048 21.0292C67.9902 18.0869 73.7668 16.1366 79.3721 17.8903C85.1682 19.7036 88.2173 26.2464 94.4121 27.2514C102.584 28.5771 107.023 25.5064 113.276 20.6125C119.927 15.4067 128.83 12.3333 137.249 15.0014C141.418 16.3225 143.116 18.7528 146.581 21.0014C149.621 22.9736 152.78 23.6197 156.284 24.2514C165.142 25.8479 172.315 17.5185 179.144 13.5014C184.459 10.3746 191.785 8.74853 195.868 14.5292C199.252 19.3205 205.597 22.9057 211.621 22.5014C215.553 22.2374 220.183 17.8356 222.979 15.5569C225.4 13.5845 227.457 11.1105 230.742 10.5292C232.718 10.1794 234.784 12.9691 236.164 14.0014C238.543 15.7801 240.717 18.4775 243.356 19.8903C249.488 23.1729 255.706 21.2551 261.079 18.0014C266.571 14.6754 270.439 11.5202 277.146 13.6125C280.725 14.7289 283.221 17.209 286.393 19.0014C292.321 22.3517 298.255 22.5014 305 22.5014" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.0039 32.6826C32.2307 32.8412 47.4552 32.8277 62.676 32.8118C67.3044 32.807 96.546 33.0555 104.728 32.0775C113.615 31.0152 104.516 28.3028 102.022 27.2826C89.9573 22.3465 77.3751 19.0254 65.0451 15.0552C57.8987 12.7542 37.2813 8.49399 44.2314 6.10216C50.9667 3.78422 64.2873 5.81914 70.4249 5.96641C105.866 6.81677 141.306 7.58809 176.75 8.59886C217.874 9.77162 258.906 11.0553 300 14.4892" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.99805 20.9998C65.6267 17.4649 126.268 13.845 187.208 12.8887C226.483 12.2723 265.751 13.2796 304.998 13.9998" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
    `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 29.8857C52.3147 26.9322 99.4329 21.6611 146.503 17.1765C151.753 16.6763 157.115 15.9505 162.415 15.6551C163.28 15.6069 165.074 15.4123 164.383 16.4275C161.704 20.3627 157.134 23.7551 153.95 27.4983C153.209 28.3702 148.194 33.4751 150.669 34.6605C153.638 36.0819 163.621 32.6063 165.039 32.2029C178.55 28.3608 191.49 23.5968 204.869 19.5404C231.903 11.3436 259.347 5.83254 288.793 5.12258C294.094 4.99476 299.722 4.82265 305 5.45025" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`
];

gsap.registerPlugin(DrawSVGPlugin, useGSAP);

let nextIndex: number | null = null;

// Add attributes to <svg> elements and synchronize colors
const decorateSVG = (svgEl: SVGElement) => {
    svgEl.setAttribute('preserveAspectRatio', 'none');
    svgEl.querySelectorAll('path').forEach((path) => {
        path.setAttribute('stroke', 'currentColor');
    });
};

interface DrawLineLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const DrawLineLink = ({ href, children, className = '', onClick }: DrawLineLinkProps) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const enterTweenRef = useRef<gsap.core.Tween | null>(null);
    const leaveTweenRef = useRef<gsap.core.Tween | null>(null);

    const handleMouseEnter = () => {
        const box = boxRef.current;
        if (!box) return;

        if (enterTweenRef.current?.isActive()) return;
        if (leaveTweenRef.current?.isActive()) {
            leaveTweenRef.current.kill();
            leaveTweenRef.current = null;
        }

        if (nextIndex === null) {
            nextIndex = Math.floor(Math.random() * svgVariants.length);
        }

        box.innerHTML = svgVariants[nextIndex];
        const svg = box.querySelector('svg');
        if (svg) {
            decorateSVG(svg);
            const path = svg.querySelector('path');
            if (path) {
                gsap.set(path, { drawSVG: '0%' });
                enterTweenRef.current = gsap.to(path, {
                    duration: 0.5,
                    drawSVG: '100%',
                    ease: 'power2.inOut',
                    onComplete: () => {
                        enterTweenRef.current = null;
                    },
                });
            }
        }

        nextIndex = (nextIndex + 1) % svgVariants.length;
    };

    const handleMouseLeave = () => {
        const box = boxRef.current;
        if (!box) return;
        const path = box.querySelector('path');
        if (!path) return;

        const playOut = () => {
            enterTweenRef.current = null;
            if (leaveTweenRef.current?.isActive()) return;
            leaveTweenRef.current = gsap.to(path, {
                duration: 0.45,
                drawSVG: '100% 100%',
                ease: 'power2.inOut',
                onComplete: () => {
                    leaveTweenRef.current = null;
                    box.innerHTML = '';
                },
            });
        };

        if (enterTweenRef.current?.isActive()) {
            enterTweenRef.current.eventCallback('onComplete', () => {
                enterTweenRef.current = null;
                playOut();
            });
        } else {
            playOut();
        }
    };

    return (
        <Link
            href={href}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-draw-line=""
            className={className}
        >
            <span className="text-draw__span">{children}</span>
            <div ref={boxRef} data-draw-line-box="" className="text-draw__box pointer-events-none" />
        </Link>
    );
};

interface MobileMenuContentProps {
    onClose: () => void;
    session: Session | null;
}

const MobileMenuContent = ({ onClose, session }: MobileMenuContentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            // Smooth fade-in for backdrop
            gsap.from('.mobile-backdrop', {
                opacity: 0,
                duration: 0.35,
                ease: 'power2.out',
            });

            // Smooth fade-in and slide from right for panel
            gsap.from('.mobile-panel', {
                opacity: 0,
                x: 28,
                duration: 0.35,
                ease: 'power3.out',
            });

            // Soft cascading entrance for navigation items
            gsap.from('.mobile-nav-item', {
                opacity: 0,
                x: 12,
                duration: 0.25,
                stagger: 0.04,
                delay: 0.08,
                ease: 'power2.out',
            });
        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef}>
            <div
                className="mobile-backdrop fixed inset-0 z-50 bg-black/25 backdrop-blur-xs dark:bg-black/50"
                aria-hidden="true"
            />
            <DialogPanel className="mobile-panel fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-gray-900 dark:sm:ring-gray-100/10">
                <div className="flex items-center justify-between">
                    <AnimatedLogo onClick={onClose} srText="DevTalles" />
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center justify-center size-8 rounded-md text-gray-700 dark:text-gray-200"
                    >
                        <span className="sr-only">Close menu</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                    </button>
                </div>
                <div className="mt-6 flow-root">
                    <div className="-my-6 divide-y divide-gray-500/10 dark:divide-white/10">
                        <div className="flex flex-col space-y-2 py-6">
                            {navigationFor(session).map((item) => (
                                <div key={item.name} className="mobile-nav-item">
                                    <DrawLineLink
                                        href={item.href}
                                        onClick={onClose}
                                        className="text-draw relative flex w-fit items-center rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                                    >
                                        {item.name}
                                    </DrawLineLink>
                                </div>
                            ))}
                        </div>
                        <div className="mobile-nav-item py-6">
                            {session?.user ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 rounded-2xl bg-neutral-100/80 p-3 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-white/10">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-600/15 font-semibold text-purple-700 dark:bg-purple-900/50 dark:text-purple-200">
                                            {((session.user.name?.[0] || '') + (session.user.lastname?.[0] || '')).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                                {[session.user.name, session.user.lastname].filter(Boolean).join(' ') || session.user.name || 'Usuario'}
                                            </span>
                                            {session.user.email && (
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                                    {session.user.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            onClose();
                                            await signOut({ callbackUrl: '/login' });
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-500/15 dark:text-red-400 cursor-pointer"
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="flex w-full items-center justify-center rounded-full border border-neutral-900/10 bg-neutral-900/4 px-4 py-2.5 text-sm font-medium tracking-tight text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md transition-all duration-150 ease-out hover:border-neutral-900/15 hover:bg-neutral-900/7 hover:text-neutral-950 active:scale-[0.97] dark:border-white/12 dark:bg-white/8 dark:text-neutral-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] dark:hover:border-white/18 dark:hover:bg-white/12 dark:hover:text-white"
                                >
                                    Log in
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </DialogPanel>
        </div>
    );
};

export interface NavbarProps {
    className?: string;
}

export const Navbar = ({ className = '' }: NavbarProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [session, setSession] = useState<Session | null>(null);



    useEffect(() => {
        let isMounted = true;

        getSession().then((currentSession) => {
            if (isMounted) {
                setSession(currentSession);
                console.log(currentSession);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <header className={`absolute inset-x-0 top-0 z-50 ${className}`.trim()}>
            <div className="mx-auto max-w-7xl">
                <div className="px-6 pt-6 lg:max-w-2xl lg:pr-0 lg:pl-8">
                    <nav aria-label="Global" className="flex items-center justify-between">
                        <div className="flex items-center gap-x-8 lg:gap-x-10">
                            <AnimatedLogo srText="DevTalles" className="text-2xl font-bold" />
                            <div className="hidden lg:flex lg:items-center lg:gap-x-8">
                                {navigationFor(session).map((item) => (
                                    <DrawLineLink
                                        key={item.name}
                                        href={item.href}
                                        className="text-draw relative inline-flex items-center h-8 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                                    >
                                        {item.name}
                                    </DrawLineLink>
                                ))}
                            </div>
                        </div>

                        {/* Differentiated Apple-style Login button or User Dropdown (Desktop) */}
                        <div className="hidden lg:flex lg:items-center">
                            {/* {session?.user ? ( */}
                            {session?.user ? (
                                <UserDropdown session={session} />
                            ) : (
                                <Link
                                    href="/login"
                                    className="group relative inline-flex items-center justify-center h-8 rounded-full border border-purple-600/10 bg-purple-600/10 px-4 text-xs sm:text-sm font-medium tracking-tight text-neutral-800 shadow-sm backdrop-blur-md transition-all duration-150 ease-out hover:border-purple-600/15 hover:bg-purple-600/10 hover:text-purple-600 active:scale-[0.96] active:bg-neutral-900/10 dark:border-white/12 dark:bg-white/8 dark:text-neutral-200 dark:shadow-sm dark:hover:border-white/18 dark:hover:bg-white/12 dark:hover:text-white dark:active:bg-white/16 cursor-pointer"
                                >
                                    Log in
                                </Link>
                            )}
                        </div>

                        {/* Mobile hamburger menu toggle */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex items-center justify-center size-8 rounded-md text-gray-700 lg:hidden dark:text-gray-200"
                        >
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="size-6" />
                        </button>
                    </nav>
                </div>
            </div>
            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                {mobileMenuOpen && (
                    <MobileMenuContent onClose={() => setMobileMenuOpen(false)} session={session} />
                )}
            </Dialog>
        </header>
    );
};

export default Navbar;
