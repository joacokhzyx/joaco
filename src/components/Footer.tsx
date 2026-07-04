"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HEADLINE = "Thank you";

// 👇 Reemplazá por tus links reales de GitHub.
const LINKS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/joacokhzyx" },
  { label: "Agroecología", href: "https://github.com/joacokhzyx/agroecologia" },
];

const YEAR = new Date().getFullYear();

const pillClass =
  "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-5 py-[9px] font-ui text-sm text-fg no-underline backdrop-blur transition-colors duration-200 hover:border-white hover:bg-white hover:text-black";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.575.106.785-.25.785-.555 0-.274-.01-1-.015-1.965-3.196.695-3.87-1.54-3.87-1.54-.523-1.33-1.277-1.685-1.277-1.685-1.044-.714.08-.699.08-.699 1.154.081 1.761 1.185 1.761 1.185 1.026 1.758 2.693 1.25 3.35.955.103-.743.401-1.25.73-1.538-2.552-.29-5.236-1.276-5.236-5.68 0-1.255.448-2.28 1.184-3.084-.119-.29-.513-1.459.112-3.041 0 0 .966-.309 3.165 1.178a11 11 0 0 1 2.881-.388c.977.005 1.962.132 2.881.388 2.198-1.487 3.163-1.178 3.163-1.178.626 1.582.232 2.751.114 3.041.737.804 1.183 1.829 1.183 3.084 0 4.415-2.688 5.386-5.248 5.671.413.355.78 1.056.78 2.13 0 1.538-.014 2.777-.014 3.155 0 .308.207.667.79.554A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/**
 * FOOTER / CTA — tutorial089 (Jelly headline motion, Lite recreation).
 * "Thank you" entra con rebote elástico y se distorsiona según la velocidad
 * del scroll, volviendo a su forma con un rebote tipo gelatina.
 */
export default function Footer() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", headline);

      // Entrada elástica al aparecer.
      gsap.from(chars, {
        yPercent: 140,
        opacity: 0,
        stagger: 0.04,
        ease: "elastic.out(1, 0.6)",
        duration: 1.2,
        scrollTrigger: { trigger: headline, start: "top 85%" },
      });

      // Jelly: reacciona a la velocidad de scroll y vuelve con rebote elástico.
      const skewTo = gsap.quickTo(chars, "skewX", {
        duration: 0.8,
        ease: "elastic.out(1, 0.3)",
      });
      const scaleTo = gsap.quickTo(chars, "scaleY", {
        duration: 0.8,
        ease: "elastic.out(1, 0.4)",
      });
      let idle: number | undefined;

      ScrollTrigger.create({
        trigger: headline,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          skewTo(gsap.utils.clamp(-18, 18, v / -180));
          scaleTo(gsap.utils.clamp(0.75, 1.25, 1 + Math.abs(v) / 2600));
          if (idle) window.clearTimeout(idle);
          idle = window.setTimeout(() => {
            skewTo(0);
            scaleTo(1);
          }, 140);
        },
      });

      return () => {
        if (idle) window.clearTimeout(idle);
      };
    }, headline);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      id="contact"
      aria-label="Contact"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-bg px-6 py-24 text-center"
    >

      <h2
        ref={headlineRef}
        aria-label={HEADLINE}
        className="m-0 font-sans font-semibold leading-[0.9] tracking-[-0.03em] text-[clamp(3.5rem,16vw,13rem)]"
      >
        {Array.from(HEADLINE).map((ch, i) => (
          <span
            key={i}
            data-char
            aria-hidden="true"
            className="inline-block will-change-transform"
            style={ch === " " ? { width: "0.28em" } : undefined}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </h2>

      <p className="mt-8 max-w-md font-ui text-base text-fg/70">
        Thanks for scrolling all the way down. Let&apos;s keep in touch.
      </p>

      <nav
        aria-label="Social links"
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={pillClass}
          >
            <GitHubIcon className="h-4 w-4" />
            {link.label}
          </a>
        ))}
      </nav>

      <p className="mt-16 font-ui text-xs text-fg/40">
        © {YEAR} Joaco
      </p>
    </footer>
  );
}