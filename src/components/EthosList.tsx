// EthosList.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Principle = {
    title: string;
    media: string;
    alt: string;
};

/**
 * The manifesto: how I think, one line per principle.
 * Each line has a matching thumbnail shown when it reaches the center.
 * Images are sourced from Wikimedia Commons (public domain / CC, no API key).
 */
const PRINCIPLES: Principle[] = [
    {
        title: "Efficient by design",
        media:
            "/003.jpg",
        alt: "A minimal 1970s computer terminal",
    },
    {
        title: "Look back to move forward",
        media:
            "/004.jpg",
        alt: "Stack of old books in a library",
    },
    {
        title: "Low-software",
        media:
            "/005.jpg",
        alt: "A small, sparse printed circuit board",
    },
    {
        title: "Architecture over scale",
        media:
            "/006.jpg",
        alt: "A brutalist concrete building",
    },
    {
        title: "Beyond Transformers",
        media:
            "/002.jpg",
        alt: "Dense macro photo of a circuit board",
    },
    {
        title: "Do more with less",
        media: "/007.jpg",
        alt: "A minimalist photograph with negative space",
    },
];

/**
 * ETHOS - Scroll List Index (Lite: GSAP + ScrollTrigger, no paid plugins).
 * - A vertical list of principles scrolls by. Each line drifts sideways as it
 *   crosses the viewport and settles as it reaches the center.
 * - A small thumbnail sits to the left of the list, pinned near the vertical
 *   center of the viewport, and crossfades to the image tied to whichever
 *   line is closest to center.
 * - Respects prefers-reduced-motion (static list, first thumbnail shown).
 */
export default function EthosList() {
    const sectionRef = useRef<HTMLElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const mediaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const list = listRef.current;
        const mediaWrap = mediaRef.current;
        if (!section || !list || !mediaWrap) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray<HTMLElement>("[data-line]", list);
            const inners = items.map((li) =>
                li.querySelector<HTMLElement>("[data-line-inner]")!,
            );
            const medias = gsap.utils.toArray<HTMLElement>("[data-media]", mediaWrap);
            const setX = inners.map((el) => gsap.quickSetter(el, "x", "px"));
            const setOpacity = inners.map((el) => gsap.quickSetter(el, "opacity"));

            let active = -1;

            const onTick = () => {
                const mid = window.innerHeight / 2;
                let best = 0;
                let bestDist = Infinity;
                const dists: number[] = [];

                items.forEach((li, i) => {
                    const rect = li.getBoundingClientRect();
                    const center = rect.top + rect.height / 2;
                    const dist = Math.abs(center - mid);
                    dists[i] = dist;
                    if (dist < bestDist) {
                        bestDist = dist;
                        best = i;
                    }
                });

                items.forEach((li, i) => {
                    const isActive = i === best;
                    setX[i](isActive ? 0 : gsap.utils.clamp(-40, 40, (dists[i] - bestDist) * 0.15));
                    setOpacity[i](isActive ? 1 : 0.3);
                    li.classList.toggle("is-active", isActive);
                });

                if (best !== active) {
                    active = best;
                    medias.forEach((m, i) => {
                        gsap.to(m, {
                            autoAlpha: i === active ? 1 : 0,
                            duration: 0.5,
                            ease: "power2.out",
                        });
                    });
                }
            };


            gsap.ticker.add(onTick);
            return () => gsap.ticker.remove(onTick);
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            aria-label="Ethos - how I think"
            className="relative bg-bg py-[12vh]"
        >
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 sm:px-12 md:grid-cols-[11rem_1fr] md:gap-10 lg:grid-cols-[13rem_1fr] lg:px-16">
                {/* Floating thumbnail */}
                <div className="order-1 hidden md:block">
                    <div className="sticky top-1/2 -translate-y-1/2">
                        <div
                            ref={mediaRef}
                            className="relative aspect-[3/2] w-full max-w-[11rem] overflow-hidden rounded-xl shadow-xl shadow-black/40 ring-1 ring-white/10 lg:max-w-[13rem]"
                        >
                            {PRINCIPLES.map((p, i) => (
                                <img
                                    key={p.title}
                                    data-media
                                    src={p.media}
                                    alt={p.alt}
                                    loading="lazy"
                                    className={`absolute inset-0 h-full w-full object-cover ${i === 0 ? "opacity-100" : "opacity-0"}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Principle list */}
                <div className="order-2">
                    <ul ref={listRef} className="m-0 list-none p-0">
                        {PRINCIPLES.map((p, i) => (
                            <li
                                key={p.title}
                                data-line
                                className="border-t border-white/10 py-[6vh] first:border-t-0"
                            >
                                <span
                                    data-line-inner
                                    className="flex items-baseline gap-4 font-sans font-medium tracking-tight text-fg text-[clamp(2rem,5.5vw,3.75rem)] will-change-transform"
                                >
                                    {p.title}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}