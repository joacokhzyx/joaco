"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import Logo from "@/components/Logo";

const PHRASES = [
  "La ausencia también es una forma de información.",
  "Buscabas algo. El vacío te devolvió la mirada.",
  "Cada camino no encontrado igual dibujó el mapa.",
  "Lo que no está aquí te recuerda lo que sí.",
];

const pill =
  "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-6 py-3 font-ui text-sm text-fg no-underline backdrop-blur transition-colors duration-200 hover:border-white hover:bg-white hover:text-black";

function PixelArrowLeft({ className }: { className?: string }) {
  const squares = [
    [0, 2], [1, 1], [1, 2], [1, 3], [2, 2], [3, 2], [4, 2],
  ];
  return (
    <svg viewBox="0 0 25 25" fill="currentColor" aria-hidden="true" className={className}>
      {squares.map(([c, r], i) => (
        <rect key={i} x={c * 5} y={r * 5} width={4} height={4} />
      ))}
    </svg>
  );
}

function renderLetters(text: string, attr: string) {
  return text.split(" ").map((word, wi) => (
    <span key={wi} aria-hidden="true" className="mr-[0.28em] inline-block whitespace-nowrap">
      {Array.from(word).map((ch, ci) => (
        <span key={ci} {...{ [attr]: "" }} className="inline-block will-change-transform">
          {ch}
        </span>
      ))}
    </span>
  ));
}

export default function NotFound() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const phraseRef = useRef<HTMLParagraphElement>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 404 — composición "anti-gravedad" + flotación continua (autoplay).
  useEffect(() => {
    const el = titleRef.current;
    if (!el || reduced()) return;

    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>("[data-title-letter]", el);

      gsap.from(letters, {
        x: () => gsap.utils.random(-360, 360),
        y: () => gsap.utils.random(-300, 300),
        rotation: () => gsap.utils.random(-140, 140),
        scale: () => gsap.utils.random(0.2, 2),
        autoAlpha: 0,
        duration: 1.6,
        ease: "power4.out",
        stagger: { each: 0.08, from: "random" },
      });

      // Flotación permanente (sensación de gravedad cero).
      letters.forEach((l, i) => {
        gsap.to(l, {
          y: `+=${gsap.utils.random(-16, 16)}`,
          rotation: gsap.utils.random(-5, 5),
          duration: gsap.utils.random(2.4, 4),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.9 + i * 0.1,
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  // Frases: se recomponen letra por letra cada vez que cambian.
  useEffect(() => {
    const el = phraseRef.current;
    if (!el) return;
    const letters = gsap.utils.toArray<HTMLElement>("[data-phrase-letter]", el);
    if (reduced()) {
      gsap.set(letters, { autoAlpha: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(letters, {
        x: () => gsap.utils.random(-120, 120),
        y: () => gsap.utils.random(-80, 80),
        rotation: () => gsap.utils.random(-40, 40),
        autoAlpha: 0,
        duration: 1,
        ease: "power3.out",
        stagger: { each: 0.02, from: "random" },
      });
    }, el);
    return () => ctx.revert();
  }, [phraseIndex]);

  // Rotación automática de frases.
  useEffect(() => {
    if (reduced()) return;
    const id = window.setInterval(
      () => setPhraseIndex((i) => (i + 1) % PHRASES.length),
      4200,
    );
    return () => window.clearInterval(id);
  }, []);

  // El scroll no controla la animación, pero la IMPULSA (acelera el timeScale).
  useEffect(() => {
    if (reduced()) return;
    const speed = { v: 1 };
    const apply = () => gsap.globalTimeline.timeScale(speed.v);
    const onWheel = (e: WheelEvent) => {
      speed.v = gsap.utils.clamp(1, 5, 1 + Math.abs(e.deltaY) / 60);
      apply();
      gsap.killTweensOf(speed);
      gsap.to(speed, { v: 1, duration: 1.6, ease: "power2.out", onUpdate: apply });
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      gsap.globalTimeline.timeScale(1);
    };
  }, []);

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-bg text-fg">
      {/* Navbar reducido: solo el logo */}
      <header className="flex justify-center py-6">
        <Link href="/" aria-label="Joaco — Home" className="inline-flex text-fg opacity-80">
          <Logo className="h-5 w-auto" />
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center sm:gap-10">
        <h1
          ref={titleRef}
          aria-label="404"
          className="m-0 font-sans font-semibold leading-none tracking-[-0.04em] text-[clamp(6rem,26vw,20rem)]"
        >
          {renderLetters("404", "data-title-letter")}
        </h1>

        <p
          key={phraseIndex}
          ref={phraseRef}
          aria-label={PHRASES[phraseIndex]}
          aria-live="polite"
          className="m-0 max-w-2xl font-serif text-[clamp(1.25rem,3vw,2rem)] italic leading-snug text-fg/85"
        >
          {renderLetters(PHRASES[phraseIndex], "data-phrase-letter")}
        </p>

        <Link href="/" className={`mt-4 ${pill}`}>
          <PixelArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}