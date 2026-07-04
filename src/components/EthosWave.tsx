// EthosWave.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Segment =
  | { type: "text"; text: string }
  | { type: "media"; label: string; src: string; alt: string };

/**
 * Copy for the traveling line (the "problem" statement).
 * Text hugs the line; media blocks sit between the words.
 * Images are sourced from Wikimedia Commons (public domain / CC, no API key).
 */
const SEGMENTS: Segment[] = [
  { type: "text", text: "We keep building more" },
  {
    type: "media",
    label: "01",
    src: "/002.jpg",
    alt: "Dense macro photo of a circuit board",
  },
  { type: "text", text: "and more " },
  {
    type: "media",
    label: "02",
    src: "/001.jpg",
    alt: "A minimal 1970s computer terminal",
  },
  { type: "text", text: "rarely more efficient." },
];

type WaveUnit =
  | { kind: "char"; char: string; key: string }
  | { kind: "media"; label: string; src: string; alt: string; key: string };

function buildUnits(segments: Segment[]): WaveUnit[] {
  const units: WaveUnit[] = [];
  segments.forEach((seg, si) => {
    if (seg.type === "text") {
      Array.from(seg.text).forEach((ch, ci) => {
        units.push({
          kind: "char",
          char: ch === " " ? "\u00A0" : ch,
          key: `t${si}-${ci}`,
        });
      });
    } else {
      units.push({
        kind: "media",
        label: seg.label,
        src: seg.src,
        alt: seg.alt,
        key: `m${si}`,
      });
    }
  });
  return units;
}

const UNITS = buildUnits(SEGMENTS);
const FULL_TEXT = SEGMENTS.filter((s) => s.type === "text")
  .map((s) => (s as Extract<Segment, { type: "text" }>).text)
  .join(" ");

/**
 * ETHOS · Wave Bend (Lite: GSAP + ScrollTrigger, no paid plugins).
 * - A single horizontal line of characters + media travels across a pinned
 *   viewport while you scroll (scrubbed).
 * - Every letter (not just each word/media block) gets its own vertical sine
 *   offset, so faster scrolling bends the line into one smooth continuous
 *   arc instead of a jagged, segment-by-segment wobble.
 * - Amplitude tracks scroll velocity, then eases back to a flat line when idle.
 * - Respects prefers-reduced-motion (renders a static, flat line).
 */
export default function EthosWave() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const units = gsap.utils.toArray<HTMLElement>("[data-wave-unit]", track);
      const setY = units.map((el) => gsap.quickSetter(el, "y", "px"));
      const setRot = units.map((el) => gsap.quickSetter(el, "rotation", "deg"));

      // Eased amplitude of the wave (0 = flat line).
      const wave = { amp: 0 };
      const width = () => Math.max(track.scrollWidth, 1);
      let idle: number | undefined;

      // Travel the line from off-screen right to off-screen left.
      gsap.fromTo(
        track,
        { x: () => window.innerWidth },
        {
          x: () => -width(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + (width() + window.innerHeight),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const target = gsap.utils.clamp(
                0,
                120,
                Math.abs(self.getVelocity()) / 55,
              );
              gsap.to(wave, {
                amp: target,
                duration: 0.3,
                ease: "power2.out",
                overwrite: true,
              });
              if (idle) window.clearTimeout(idle);
                idle = window.setTimeout(() => {
                gsap.to(wave, { amp: 0, duration: 1, ease: "power2.out" });
                }, 120);
            },
          },
        },
      );

      // Per-frame: bend every letter/media block along one continuous sine
      // curve based on its x position. A large phase divisor keeps the curve
      // smooth across the whole line instead of producing many small waves.
      const onTick = () => {
        units.forEach((unit, i) => {
          const rect = unit.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const phase = cx / 340;
          setY[i](wave.amp * Math.sin(phase));
          setRot[i](wave.amp * 0.06 * Math.cos(phase));
        });
      };
      gsap.ticker.add(onTick);

      return () => {
        gsap.ticker.remove(onTick);
        if (idle) window.clearTimeout(idle);
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Ethos - the problem"
      className="relative min-h-[100dvh] overflow-x-clip overflow-y-hidden bg-bg"
    >
      <span className="sr-only">{FULL_TEXT}</span>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div
          ref={trackRef}
          className="flex w-max items-center whitespace-nowrap will-change-transform"
        >
          {UNITS.map((unit) =>
            unit.kind === "char" ? (
              <span
                key={unit.key}
                data-wave-unit
                className="inline-block font-sans font-semibold tracking-tight text-fg text-[clamp(2.5rem,9vw,7rem)] will-change-transform"
              >
                {unit.char}
              </span>
            ) : (
              <span
                key={unit.key}
                data-wave-unit
                className="mx-4 inline-block align-middle will-change-transform sm:mx-7"
              >
                <span className="relative grid h-[clamp(3rem,8vw,6rem)] w-[clamp(3rem,8vw,6rem)] place-items-end overflow-hidden rounded-2xl bg-white/5">
                  <img
                    src={unit.src}
                    alt={unit.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="relative m-2 rounded-full bg-black/50 px-2 py-0.5 font-ui text-xs text-white/80">
                    {unit.label}
                  </span>
                </span>
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}