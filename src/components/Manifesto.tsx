"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Value = {
    index: string;
    title: string;
    description: string;
    media: string;
    alt: string;
    bg: string;
    ink: string;
};

/**
 * MANIFESTO — tutorial031 (Scrolling sections, Lite recreation).
 * Verbos/acción que expanden la tesis "Think deeper. Build better.".
 * Cada slide se fija al top y recede en 3D mientras entra la siguiente.
 */
const VALUES: Value[] = [
    {
        index: "01",
        title: "Think deeper",
        description:
            "Before a single line of code, understand the real problem. Depth beats speed.",
        media: "/001.jpg",
        alt: "Preview of deep, considered work",
        bg: "#ededed",
        ink: "#0a0a0b",
    },
    {
        index: "02",
        title: "Build less",
        description:
            "The best system is the one you didn't have to build. Efficient by design, architecture over scale.",
        media: "/006.jpg",
        alt: "Minimal, sparse architecture",
        bg: "#c6f24e",
        ink: "#243a00",
    },
    {
        index: "03",
        title: "Ship better",
        description:
            "Craft that survives contact with reality. Fewer features, done right.",
        media: "/003.jpg",
        alt: "Refined, finished craft",
        bg: "#f6402c",
        ink: "#fff2f0",
    },
    {
        index: "04",
        title: "Prove it",
        description:
            "Research you can verify, results you can measure. No hand-waving.",
        media: "/002.jpg",
        alt: "Measurable, verifiable results",
        bg: "#ededed",
        ink: "#0a0a0b",
    },
];

function PixelArrow({ className }: { className?: string }) {
    // Flecha diagonal (↙) hecha con cuadraditos, hereda el color (currentColor).
    const squares = [
        [4, 0], [3, 1], [2, 2], [1, 3], [0, 4], // diagonal
        [0, 2], [0, 3], [1, 4], [2, 4],          // punta
    ];
    return (
        <svg viewBox="0 0 25 25" fill="currentColor" aria-hidden="true" className={className}>
            {squares.map(([c, r], i) => (
                <rect key={i} x={c * 5} y={r * 5} width={4} height={4} />
            ))}
        </svg>
    );
}

export default function Manifesto() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            const slides = gsap.utils.toArray<HTMLElement>(".slide", section);

            slides.forEach((slide, i) => {
                const content = slide.querySelector<HTMLElement>(".content");
                const isLast = i === slides.length - 1;

                // Se fija cada slide (menos el último). pinSpacing:false => el
                // siguiente slide scrollea por encima, creando el apilado.
                if (!isLast) {
                    ScrollTrigger.create({
                        trigger: slide,
                        start: "top top",
                        end: "+=100%",
                        pin: true,
                        pinSpacing: false,
                        scrub: true,
                    });

                    // Recede hacia el fondo mientras entra el siguiente.
                    if (content) {
                        gsap.fromTo(
                            content,
                            { filter: "brightness(1)" }, // 👈 estado inicial explícito
                            {
                                scale: 0.82,
                                rotateX: 12,
                                y: -60,
                                autoAlpha: 0.35,
                                filter: "brightness(0.55)",
                                ease: "none",
                                scrollTrigger: {
                                    trigger: slide,
                                    start: "top top",
                                    end: "+=100%",
                                    scrub: true,
                                },
                            },
                        );
                    }
                }
            });
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            aria-label="Manifesto"
            className="mwg_effect031 relative bg-bg"
        >
            {VALUES.map((v) => (
                <div
                    key={v.index}
                    className="slide relative h-[100dvh] w-full overflow-hidden"
                >
                    <div className="content-wrapper absolute inset-0 [perspective:1200px]">
                        <div
                            className="content absolute inset-0 flex flex-col justify-between p-6 will-change-transform [transform-style:preserve-3d] sm:p-12 lg:p-16"
                            style={{ backgroundColor: v.bg, color: v.ink }}
                        >
                            {/* Fila superior: título + flecha */}
                            <div className="flex items-start justify-between gap-6">
                                <h3 className="m-0 font-sans font-semibold leading-[0.9] tracking-[-0.02em] text-[clamp(3rem,10vw,8rem)]">
                                    {v.title}
                                </h3>
                                <PixelArrow className="mt-3 h-9 w-9 shrink-0 sm:h-14 sm:w-14" />
                            </div>

                            {/* Fila inferior: descripción + número + miniatura */}
                            <div className="flex items-end justify-between gap-6">
                                <p className="m-0 max-w-xs font-ui text-sm leading-snug opacity-80 sm:text-base">
                                    {v.description}
                                </p>
                                <div className="flex items-end gap-4 sm:gap-8">
                                    <span className="font-sans leading-none text-[clamp(3rem,9vw,7rem)]">
                                        ({v.index})
                                    </span>
                                    <img
                                        src={v.media}
                                        alt={v.alt}
                                        loading="lazy"
                                        className="hidden h-[16vh] w-[22vw] max-w-[280px] rounded-md object-cover sm:block"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}