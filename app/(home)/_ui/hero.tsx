'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import LearnMoreButton from '@/components/pixel-perfect/learn-more-button'
import MagneticWarp from '@/components/pixel-perfect/magnetic-warp'
import Navbar from './navbar'
// import RocketBlast from './ascii/rocket-blast'

const Hero = () => {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role?.toLowerCase() === 'admin'
    const discoverHref = !session?.user ? '/register' : '/admin/assessments'
    const roadmapsHref = !session?.user
        ? '/login'
        : isAdmin
            ? '/admin/roadmaps'
            : '/admin/roadmaps/mios'

    return (
        <div className="bg-white dark:bg-gray-900">
            <Navbar />

            <div className="relative">
                <div className="mx-auto max-w-7xl">
                    <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
                        <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-white lg:block dark:fill-gray-900"
                        >
                            <polygon points="0,0 90,0 50,100 0,100" />
                        </svg>

                        {/* section text */}
                        <div className="relative px-6 py-28 sm:py-36 lg:px-8 lg:py-36 lg:pr-0">
                            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                                {/* Eyebrow Badge with interactive LearnMoreButton effects */}
                                <div className="mb-7 flex">
                                    <LearnMoreButton
                                        href={discoverHref}
                                        badge="2026"
                                        text="Roadmaps de Programación"
                                        actionText="Explorar"
                                        boxShadow=''
                                    />
                                </div>

                                {/* Headline H1 with optical tracking & tight leading */}
                                <h1 className="text-4xl font-semibold tracking-[-0.035em] text-pretty text-neutral-950 sm:text-5xl lg:text-[3.25rem] leading-[1.12] dark:text-white">
                                    El roadmap exacto para aprender a programar lo que imaginas
                                </h1>

                                {/* Subtitle */}
                                <p className="mt-6 text-base sm:text-lg font-normal leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-lg tracking-[-0.01em]">
                                    Rutas paso a paso diseñadas para llevarte desde tus primeras líneas de código hasta desarrollar aplicaciones reales y dominar las tecnologías que necesitas.
                                </p>

                                {/* Moderate High-End Action CTAs */}
                                <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-4">
                                    <Link
                                        href={discoverHref}
                                        className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-purple-600 dark:bg-purple-600 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white dark:text-neutral-950 shadow-sm transition-all duration-150 ease-out hover:bg-purple-700 dark:hover:bg-purple-700 active:scale-[0.98] cursor-pointer"
                                    >
                                        <span>Descubrir mi ruta</span>
                                        <span className="flex size-4.5 items-center justify-center rounded-full bg-white/15 dark:bg-black/10 transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                                            <ArrowRight className="size-2.5 stroke-[2.5]" />
                                        </span>
                                    </Link>

                                    <Link
                                        href={roadmapsHref}
                                        className="inline-flex items-center justify-center rounded-full border border-purple-600 dark:border-purple-600 bg-transparent px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-purple-600 dark:text-purple-600 transition-all duration-150 ease-out hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-100/20 dark:hover:bg-purple-800/20 active:scale-[0.98] cursor-pointer"
                                    >
                                        Ver roadmaps
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pointer-events-none bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 dark:bg-gray-800">
                    {/* <img
            alt=""
            src="https://cdn.cosmos.so/66f53774-ad96-4c47-9f2f-1e022865a82d?format=webp"
            // src="https://images.unsplash.com/photo-1483389127117-b6a2102724ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1587&q=80"
            className="aspect-3/2 object-cover lg:aspect-auto lg:size-full"
          /> */}
                    <MagneticWarp
                        // image='https://cdn.cosmos.so/b34094d1-8f3d-4b98-b796-51e0056e6fa0?format=webp'
                        // image='https://cdn.cosmos.so/1177f14b-f9f4-4a4a-ad41-d84ade65617a?format=webp'
                        image='https://cdn.cosmos.so/fbcbfd35-6bce-4b93-9092-6bb5cf71957f?format=webp'
                        // image='https://cdn.cosmos.so/47cd1771-354b-4e39-9e7a-d578d56589e9?format=webp'
                        className="aspect-3/2 object-cover lg:aspect-auto lg:size-full"
                    />
                    {/* <RocketBlast  /> */}
                </div>
            </div>
        </div>
    )
}

export default Hero