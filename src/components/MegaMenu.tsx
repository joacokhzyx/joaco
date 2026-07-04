"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type Item = { label: string; href: string };

type MegaMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ITEMS: Item[] = [
  { label: "Home", href: "#" },
  { label: "Works", href: "#works" },
  { label: "Manifesto", href: "#manifesto" },
  { label: "Contact", href: "#contact" },
];

// Meta inferior del menú (mismos links que usás en el footer).
const META: Item[] = [
  { label: "GitHub", href: "https://github.com/joacokhzyx" },
  { label: "Email", href: "mailto:joaquindheredia@sanluis.edu.ar" },
];

/** Link del menú: reveal letra por letra al abrir + roll en hover (tutorial027). */
function MenuLink({ label, href, onNavigate }: Item & { onNavigate: () => void }) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const rolls = gsap.utils.toArray<HTMLElement>("[data-roll]", root);
      gsap.set(rolls, { yPercent: -50 }); // copia inferior visible en reposo
      tlRef.current = gsap
        .timeline({ paused: true })
        .to(rolls, { yPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.03 });
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
      onClick={onNavigate}
      className="relative inline-flex font-sans font-semibold leading-[1] tracking-[-0.02em] text-fg no-underline text-[clamp(2.75rem,11vw,8rem)]"
    >
      {chars.map((ch, i) => {
        const glyph = ch === " " ? "\u00A0" : ch;
        return (
          // Máscara de entrada (open stagger anima [data-menu-letter]).
          <span
            key={`${ch}-${i}`}
            aria-hidden="true"
            className="relative inline-block h-[1.05em] overflow-hidden leading-[1.05em]"
          >
            <span data-menu-letter className="block will-change-transform">
              {/* Roll de hover (dos copias apiladas). */}
              <span data-roll className="block will-change-transform">
                <span className="block h-[1.05em] leading-[1.05em]">{glyph}</span>
                <span className="block h-[1.05em] leading-[1.05em]">{glyph}</span>
              </span>
            </span>
          </span>
        );
      })}
    </a>
  );
}

export default function MegaMenu({ open, onOpenChange }: MegaMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Construye el timeline de apertura una sola vez.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>("[data-menu-letter]", overlay);
      const meta = gsap.utils.toArray<HTMLElement>("[data-menu-meta]", overlay);

      gsap.set(overlay, { display: "none", autoAlpha: 0 });
      if (!reduce) gsap.set(letters, { yPercent: 110 });

      const tl = gsap.timeline({
        paused: true,
        onStart: () => {
          gsap.set(overlay, { display: "flex" });
          document.documentElement.style.overflow = "hidden";
        },
        onReverseComplete: () => {
          gsap.set(overlay, { display: "none" });
          document.documentElement.style.overflow = "";
        },
      });

      if (reduce) {
        tl.set(overlay, { autoAlpha: 1 });
      } else {
        tl.set(overlay, { autoAlpha: 1 })
          .fromTo(
            overlay,
            { clipPath: "inset(0 0 100% 0)" },
            { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power4.inOut" },
            0,
          )
          .to(letters, { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.03 }, 0.3)
          .fromTo(
            meta,
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 },
            0.5,
          );
      }
      tlRef.current = tl;
    }, overlayRef);

    return () => {
      document.documentElement.style.overflow = "";
      ctx.revert();
    };
  }, []);

  // Play / reverse según estado.
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (open) tl.play();
    else tl.reverse();
  }, [open]);

  // Cerrar con Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  return (
    <>
      {/* Overlay full-screen */}
      <div
        ref={overlayRef}
        id="mega-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className="fixed inset-0 z-50 hidden flex-col justify-between bg-accent px-6 pb-10 pt-28 sm:px-12 lg:px-16"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close menu"
          className="absolute right-6 top-6 inline-flex items-center gap-2 font-ui text-base tracking-wide text-fg/90 transition hover:text-fg sm:right-12 sm:top-8 lg:right-16"
        >
          <span>Close</span>
        </button>

        <nav aria-label="Menu" className="flex flex-col gap-1 sm:gap-2">
          {ITEMS.map((item) => (
            <MenuLink key={item.href} {...item} onNavigate={() => onOpenChange(false)} />
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-ui text-sm text-fg/80">
          {META.map((m) => (
            <a
              key={m.href}
              data-menu-meta
              href={m.href}
              target={m.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="no-underline transition-colors hover:text-fg"
            >
              {m.label}
            </a>
          ))}
          <span data-menu-meta className="ml-auto text-fg/60">
            © {new Date().getFullYear()} Joaco
          </span>
        </div>
      </div>
    </>
  );
}