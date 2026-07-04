"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Row = { text: string; dir: 1 | -1 };

const ROWS: Row[] = [
  { text: "DESIGN  CODE  RESEARCH  MOTION  ", dir: -1 },
  { text: "THINK DEEPER  BUILD BETTER  ", dir: 1 },
  { text: "AI  FULL-STACK  CREATIVE DEV  ", dir: -1 },
];

// Shared type styling (self-contained; no global CSS required).
const LAYER =
  "absolute inset-0 flex flex-col justify-center gap-2 sm:gap-4 select-none font-sans font-extrabold uppercase tracking-tight leading-[1.05] text-[clamp(2.5rem,9vw,7rem)]";
const OUTLINE =
  "text-transparent [-webkit-text-stroke:1.2px_rgba(255,255,255,0.18)]";
const SPOTLIGHT_MASK =
  "[-webkit-mask-image:radial-gradient(circle_180px_at_var(--mx,50%)_var(--my,50%),#000_0%,#000_34%,transparent_72%)] [mask-image:radial-gradient(circle_180px_at_var(--mx,50%)_var(--my,50%),#000_0%,#000_34%,transparent_72%)]";
const GLOW =
  "[background:radial-gradient(240px_circle_at_var(--mx,50%)_var(--my,50%),rgba(218, 173, 171, 0.22),transparent_62%)]";

/**
 * "DEEPER" — a purely visual interlude (Lite: GSAP + Lenis, no WebGL).
 * - Kinetic marquee rows whose skewX reacts to scroll velocity.
 * - A red spotlight follows the cursor and "lights up" the words in accent red
 *   (a masked reveal layer over the outline base layer).
 * - Respects prefers-reduced-motion (renders a static outline).
 */
export default function Deeper() {
  const sectionRef = useRef<HTMLElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const base = baseRef.current;
    const reveal = revealRef.current;
    if (!section || !base || !reveal) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const baseTracks = gsap.utils.toArray<HTMLElement>("[data-mtrack]", base);
      const revealTracks = gsap.utils.toArray<HTMLElement>("[data-mtrack]", reveal);

      // Seamless marquee: both layers move together per row (kept in sync).
      ROWS.forEach((row, i) => {
        const targets = [baseTracks[i], revealTracks[i]];
        const from = row.dir === -1 ? 0 : -50;
        const to = row.dir === -1 ? -50 : 0;
        gsap.fromTo(
          targets,
          { xPercent: from },
          { xPercent: to, duration: 22, ease: "none", repeat: -1 },
        );
      });

      // Skew reactive to scroll velocity, easing back to 0 when idle.
      const rows = gsap.utils.toArray<HTMLElement>("[data-mrow]");
      const skewTo = gsap.quickTo(rows, "skewX", { duration: 0.5, ease: "power3" });
      let idle: number | undefined;
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const skew = gsap.utils.clamp(-14, 14, self.getVelocity() / -280);
          skewTo(skew);
          if (idle) window.clearTimeout(idle);
          idle = window.setTimeout(() => skewTo(0), 130);
        },
      });

      // Red spotlight follows the cursor (updates CSS vars on the section).
      const onMove = (e: PointerEvent) => {
        const rect = section.getBoundingClientRect();
        section.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        section.style.setProperty("--my", `${e.clientY - rect.top}px`);
      };
      section.addEventListener("pointermove", onMove);

      return () => {
        section.removeEventListener("pointermove", onMove);
        if (idle) window.clearTimeout(idle);
      };
    }, section);

    return () => ctx.revert();
  }, []);

  const renderRows = (variant: "base" | "reveal") =>
    ROWS.map((row, i) => (
      <div key={`${variant}-${i}`} data-mrow className="will-change-transform">
        <div data-mtrack className="inline-flex w-max whitespace-nowrap">
          <span>{row.text}</span>
          <span aria-hidden="true">{row.text}</span>
        </div>
      </div>
    ));

  return (
    <section
      ref={sectionRef}
      aria-label="Deeper"
      className="relative min-h-[100dvh] overflow-hidden bg-bg"
    >
      <div ref={baseRef} aria-hidden="true" className={`${LAYER} ${OUTLINE}`}>
        {renderRows("base")}
      </div>
      <div
        ref={revealRef}
        aria-hidden="true"
        className={`${LAYER} ${SPOTLIGHT_MASK} pointer-events-none text-accent`}
      >
        {renderRows("reveal")}
      </div>
      <div
        aria-hidden="true"
        className={`${GLOW} pointer-events-none absolute inset-0 mix-blend-screen`}
      />
    </section>
  );
}