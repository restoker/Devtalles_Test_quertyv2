'use client';

// import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUp } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import Image from 'next/image';

const FOOTER_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { name: 'Roadmaps 2026', href: '/#features' },
      { name: 'Our story', href: '/about' },
      { name: 'How it works', href: '/#features' },
      { name: 'User stories', href: '/blogs' },
      { name: 'FAQs', href: '/faqs' },
    ],
  },
  {
    title: 'App',
    links: [
      { name: 'Download for iOS', href: '/login', badge: 'Soon' },
      { name: 'Download for Android', href: '/login', badge: 'Soon' },
      { name: 'Web Terminal', href: '/login' },
      { name: 'Marketplace', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Security Overview', href: '/security' },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://twitter.com',
    icon: (
      <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function FuturisticFooter() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="relative w-full pt-16 sm:pt-28 pb-14 text-neutral-300 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* 1. PANORAMIC CALL-TO-ACTION BANNER (Matching reference design) */}
        <section
          aria-label="Call to action banner"
          className="relative w-full overflow-hidden rounded-[2.25rem] sm:rounded-[3rem] border border-white/20 bg-neutral-900 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] min-h-95 sm:min-h-110 lg:min-h-120 flex items-center justify-center p-8 sm:p-14 lg:p-16 text-center"
        >
          {/* Panoramic high-resolution scenic landscape artwork */}
          <Image
            width={0}
            height={0}
            sizes='100vw'
            src="/img/baner.gif"
            alt="Futuristic serene rolling hills with flowing cyber river"
            className="absolute inset-0 size-full object-cover object-center select-none pointer-events-none scale-[1.02]"
          />
          {/* <video
            autoPlay
            muted
            loop
            className="absolute inset-0 size-full object-cover object-center select-none pointer-events-none scale-[1.02]"
          >
            <source src="/videos/footer-banner.mp4" type="video/mp4" />
          </video> */}

          {/* Frosted vignette scrim & specular highlights for crystal-clear optical legibility */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/25 to-black/35 backdrop-blur-[0.5px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent"
          />

          {/* Centered content with Apple typography hierarchy */}
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className='relative mix-blend-difference'>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-[-0.035em] text-white leading-[1.12] text-balance drop-shadow-md ">
                {/* resume este tiutlo en una sola linea */}
                Acelera tu aprendizaje con el roadmap exacto.
              </h2>
              <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg font-normal text-white/90 max-w-xl mx-auto tracking-[-0.01em] leading-relaxed drop-shadow">
                Aprende con rutas estructuradas, fundamentos sólidos y metodologías de ingeniería listas para el mundo real.
              </p>
            </div>

            <div className="mt-8 sm:mt-10">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-neutral-900 shadow-xl shadow-black/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-neutral-100 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.97] cursor-pointer mix-blend-difference"
              >
                <span>Comienza ahora</span>
                <span className="flex size-5 items-center justify-center rounded-full bg-neutral-900/5 transition-transform duration-200 ease-out group-hover:translate-x-1">
                  <ArrowRight className="size-3.5 stroke-[2.5]" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. REFINED MINIMALIST FOOTER (Matching reference layout below the banner) */}
        <div className="pt-16 sm:pt-20 lg:pt-24">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 items-start">

            {/* Left: Brand Identity with futuristic squircle icon & wordmark */}
            <div className="lg:col-span-5 flex flex-col items-start space-y-4">
              {/* <Link
                href="/"
                className="group inline-flex items-center gap-3 active:scale-[0.98] transition-transform duration-150"
              > */}
              {/* Emerald glowing squircle mark matching Relay reference style */}
              {/* <div className="relative flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                  <span className="size-3.5 rounded-full border-2 border-white/90 flex items-center justify-center">
                    <span className="size-1 rounded-full bg-white"></span>
                  </span>
                </div> */}

              <div className="flex flex-col">
                <AnimatedLogo className='text-white' />
              </div>
              {/* </Link> */}

              <p className="text-sm text-zinc-300 max-w-sm leading-relaxed tracking-[-0.01em]">
                Rutas de aprendizaje estructuradas, fundamentos sólidos y metodologías de ingeniería listas para el mundo real.
              </p>

            </div>

            {/* Right: Clean Navigation Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-7">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title} className="flex flex-col space-y-3.5">
                  <h3 className="text-sm font-semibold text-white tracking-[-0.01em]">
                    {column.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {column.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors duration-150 hover:text-white active:scale-[0.98]"
                        >
                          <span className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                            {link.name}
                          </span>
                          {link.badge && (
                            <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-neutral-300">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>

          {/* 3. SUB-FOOTER: Copyright on the left & Circular pill social links on the right */}
          <div className="mt-16 sm:mt-20 pt-8 border-t border-white/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-xs sm:text-sm text-neutral-400 tracking-tight">
              <span>© {new Date().getFullYear()} DevTalles. All rights reserved.</span>
            </div>

            {/* Circular white button social group (matching reference image) */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  className="size-9 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-md transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:bg-neutral-100 hover:shadow-lg active:scale-95"
                >
                  {item.icon}
                </a>
              ))}

              {/* Smooth back-to-top pill button */}
              <button
                onClick={scrollToTop}
                type="button"
                aria-label="Volver al inicio"
                title="Volver arriba"
                className="size-9 rounded-full border border-white/20 bg-white/10 text-white flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:bg-white/20 active:scale-95 cursor-pointer ml-1"
              >
                <ArrowUp className="size-4 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
