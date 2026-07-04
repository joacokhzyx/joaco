"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

type RollLinkProps = {
  href: string;
  label: string;
};

/**
 * Navlink with a word-progressive "roll" effect.
 * - The incoming copy falls in from the TOP.
 * - Letters animate with a stagger, so the roll travels across the word.
 * - Settles on a hand-tuned cubic-bezier (CustomEase) with a subtle overshoot.
 * - Color never changes: both stacked copies share the same color.
 * - Respects prefers-reduced-motion.
 */
export default function RollLink({ href, label }: RollLinkProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Register + build the ease on the client (SSR-safe).
    gsap.registerPlugin(CustomEase);
    // (x1, y1, x2, y2) — tweak y1 to dial the overshoot amount.
    const rollEase = CustomEase.create("rollBezier", "0.22, 1.15, 0.32, 1");

    const ctx = gsap.context(() => {
      const inners = gsap.utils.toArray<HTMLElement>("[data-roll]");
      // Start with the bottom copy showing (inner is two letters tall).
      gsap.set(inners, { yPercent: -50 });
      tlRef.current = gsap.timeline({ paused: true }).to(inners, {
        yPercent: 0,
        duration: 0.6,
        ease: rollEase,
        stagger: 0.04,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const play = () => tlRef.current?.play();
  const reverse = () => tlRef.current?.reverse();

  const chars = Array.from(label);

  return (
    <a
      ref={rootRef}
      href={href}
      aria-label={label}
      onMouseEnter={play}
      onMouseLeave={reverse}
      onFocus={play}
      onBlur={reverse}
      className="relative inline-flex font-ui text-base tracking-wide text-fg no-underline"
    >
      {chars.map((ch, i) => {
        const glyph = ch === " " ? "\u00A0" : ch;
        return (
          <span
            key={`${ch}-${i}`}
            aria-hidden="true"
            className="relative inline-block h-[1.35em] overflow-hidden leading-[1.35em]"
          >
            <span data-roll className="block will-change-transform">
              <span className="block h-[1.35em]">{glyph}</span>
              <span className="block h-[1.35em]">{glyph}</span>
            </span>
          </span>
        );
      })}
    </a>
  );
}