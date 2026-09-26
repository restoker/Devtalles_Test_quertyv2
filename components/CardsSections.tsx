'use client';

import { useGSAP } from '@gsap/react';
import React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CardsSections = () => {

    const containerRef = React.useRef<HTMLDivElement>(null);
    const stickyRef = React.useRef<HTMLDivElement>(null);
    const lenis = useLenis();

    useGSAP(() => {
        if (!lenis) return;
        // const lenis = n  ew Lenis();
        lenis.on("scroll", ScrollTrigger.update);
        // gsap.ticker.add((time) => {
        // lenis.raf(time * 1000);
        // });
        // gsap.ticker.lagSmoothing(0);

        if (!containerRef.current) return;

        const cardContainer = containerRef.current.querySelector(".card-container");
        const stickyHeader = containerRef.current.querySelector(".sticky-header h1");
        let isGapAnimationCompleted = false;
        let isFlipAnimationCompleted = false;

        function initAnimations() {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

            const mm = gsap.matchMedia();

            mm.add("(max-width: 999px)", () => {
                document
                    .querySelectorAll(".card, .card-container, .sticky-header h1")
                    .forEach((el: Element) => {
                        (el as HTMLElement).style.cssText = "";
                    });

                const mobileTrigger = ScrollTrigger.create({
                    trigger: stickyRef.current,
                    start: "top 80%",
                    end: "top 25%",
                    scrub: 1,
                    onUpdate: (self) => {
                        const colorProgress = gsap.utils.clamp(0, 1, self.progress);
                        const textColor = gsap.utils.interpolate("#000000", "#ffffff", colorProgress);

                        if (stickyRef.current) {
                            gsap.set(stickyRef.current, {
                                color: textColor,
                            });
                        }
                        if (stickyHeader) {
                            gsap.set(stickyHeader, {
                                color: textColor,
                            });
                        }
                    },
                });

                return () => {
                    mobileTrigger.kill();
                    if (stickyRef.current) {
                        stickyRef.current.style.backgroundColor = "";
                        stickyRef.current.style.color = "";
                    }
                    if (stickyHeader) {
                        (stickyHeader as HTMLElement).style.color = "";
                    }
                };
            });

            mm.add("(min-width: 1000px)", () => {
                // Initialize start values
                if (stickyRef.current) {
                    stickyRef.current.style.backgroundColor = "";
                    gsap.set(stickyRef.current, {
                        color: "#000000",
                    });
                }
                if (stickyHeader) {
                    gsap.set(stickyHeader, {
                        color: "#000000",
                    });
                }

                ScrollTrigger.create({
                    trigger: stickyRef.current,
                    start: "top top",
                    end: () => `+=${window.innerHeight * 4}px`,
                    scrub: 1,
                    pin: true,
                    pinSpacing: true,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress;

                        // Progressive text color scrub (phase 0 -> 0.25)
                        const colorProgress = gsap.utils.clamp(
                            0,
                            1,
                            gsap.utils.mapRange(0, 0.25, 0, 1, progress)
                        );
                        const textColor = gsap.utils.interpolate("#000000", "#ffffff", colorProgress);

                        if (stickyRef.current) {
                            gsap.set(stickyRef.current, {
                                color: textColor,
                            });
                        }
                        if (stickyHeader) {
                            gsap.set(stickyHeader, {
                                color: textColor,
                            });
                        }

                        if (progress >= 0.1 && progress <= 0.25) {
                            const headerProgress = gsap.utils.mapRange(
                                0.1,
                                0.25,
                                0,
                                1,
                                progress
                            );
                            const yValue = gsap.utils.mapRange(0, 1, 30, 0, headerProgress);
                            const opacityValue = gsap.utils.mapRange(
                                0,
                                1,
                                0,
                                1,
                                headerProgress
                            );

                            gsap.set(stickyHeader, {
                                y: yValue,
                                opacity: opacityValue,
                            });
                        } else if (progress < 0.1) {
                            gsap.set(stickyHeader, {
                                y: 30,
                                opacity: 0,
                            });
                        } else if (progress > 0.25) {
                            gsap.set(stickyHeader, {
                                y: 0,
                                opacity: 1,
                            });
                        }

                        if (progress <= 0.25) {
                            const widthPercentage = gsap.utils.mapRange(
                                0,
                                0.25,
                                75,
                                60,
                                progress
                            );
                            gsap.set(cardContainer, { width: `${widthPercentage}%` });
                        } else {
                            gsap.set(cardContainer, { width: "60%" });
                        }

                        if (progress >= 0.35 && !isGapAnimationCompleted) {
                            gsap.to(cardContainer, {
                                gap: "20px",
                                duration: 0.5,
                                ease: "power3.out",
                            });

                            gsap.to(["#card-1", "#card-2", "#card-3"], {
                                borderRadius: "20px",
                                // border: "1px solid #fff",
                                duration: 0.5,
                                ease: "power3.out",
                            });

                            isGapAnimationCompleted = true;
                        } else if (progress < 0.35 && isGapAnimationCompleted) {
                            gsap.to(cardContainer, {
                                gap: "0px",
                                duration: 0.5,
                                ease: "power3.out",
                            });

                            gsap.to("#card-1", {
                                borderRadius: "20px 0 0 20px",
                                duration: 0.5,
                                ease: "power3.out",
                            });

                            gsap.to("#card-2", {
                                borderRadius: "0px",
                                duration: 0.5,
                                ease: "power3.out",
                            });

                            gsap.to("#card-3", {
                                borderRadius: "0 20px 20px 0",
                                duration: 0.5,
                                ease: "power3.out",
                            });

                            isGapAnimationCompleted = false;
                        }

                        if (progress >= 0.7 && !isFlipAnimationCompleted) {
                            gsap.to(".card", {
                                rotationY: 180,
                                duration: 0.75,
                                ease: "power3.inOut",
                                stagger: 0.1,
                            });

                            gsap.to(["#card-1", "#card-3"], {
                                y: 30,
                                rotationZ: (i) => [-15, 15][i],
                                duration: 0.75,
                                ease: "power3.inOut",
                            });

                            isFlipAnimationCompleted = true;
                        } else if (progress < 0.7 && isFlipAnimationCompleted) {
                            gsap.to(".card", {
                                rotationY: 0,
                                duration: 0.75,
                                ease: "power3.inOut",
                                stagger: -0.1,
                            });

                            gsap.to(["#card-1", "#card-3"], {
                                y: 0,
                                rotationZ: 0,
                                duration: 0.75,
                                ease: "power3.inOut",
                            });

                            isFlipAnimationCompleted = false;
                        }
                    },
                });
                return () => { };
            });
        }

        initAnimations();


        let resizeTimer: NodeJS.Timeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                initAnimations();
            }, 250);
        });

        return () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
            ScrollTrigger.refresh();
        }

    }, { scope: containerRef, dependencies: [lenis] })

    return (
        <div ref={containerRef} id="features" className="" >
            <section ref={stickyRef} className="pegajoso relative w-full h-svh p-8 text-white flex items-center justify-center overflow-hidden">
                <div className="sticky-header mix-blend-difference">
                    <h1 className='text-center flex flex-col items-center select-none'>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full text-xs font-mono font-medium tracking-widest text-purple-300 bg-purple-500/10 border border-purple-500/25 backdrop-blur-md uppercase">
                            Metodología DevTalles
                        </span>
                        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] leading-[1.12] text-current max-w-3xl">
                            Tres principios para descubrir tu roadmap
                        </span>
                    </h1>
                </div>

                <div className="card-container">
                    <div className="card" id="card-1">
                        <div className="card-front">
                            <img className='size-full object-cover' src="/img/6.jpeg" alt="" />
                        </div>
                        <div className="card-back">
                            <span className='text-white'>( 01 )</span>
                            <p className='text-3xl text-white font-semibold leading-tight'>Define tu Rol y Objetivo</p>
                        </div>
                    </div>

                    <div className="card" id="card-2">
                        <div className="card-front">
                            <img className='size-full object-cover' src="/img/5.jpeg" alt="" />
                        </div>
                        <div className="card-back">
                            <span className='text-white'>( 02 )</span>
                            <p className='text-3xl text-white font-semibold leading-tight'>Fundamentos antes de Frameworks</p>
                        </div>
                    </div>

                    <div className="card" id="card-3">
                        <div className="card-front">
                            <img className='size-full object-cover' src="/img/4.jpeg" alt="" />
                        </div>
                        <div className="card-back">
                            <span className='text-white'>( 03 )</span>
                            <p className='text-3xl text-white font-semibold leading-tight'>Tecnologías con Demanda Real</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default CardsSections