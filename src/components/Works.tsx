// src/components/Works.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type ProjectThumb = {
  title: string;
  src: string;
  alt: string;
};

const WORD = "WORKS";

const PROJECTS: ProjectThumb[] = [
  { title: "Agroecología", src: "/001.jpg", alt: "Vista previa de Agroecología" },
  { title: "Proyecto 2", src: "/002.jpg", alt: "Vista previa del proyecto 2" },
  { title: "Proyecto 3", src: "/003.jpg", alt: "Vista previa del proyecto 3" },
  { title: "Proyecto 4", src: "/004.jpg", alt: "Vista previa del proyecto 4" },
  { title: "Proyecto 5", src: "/005.jpg", alt: "Vista previa del proyecto 5" },
];

const INTRO_PHRASES = ["Here I present to you", "some of my best"];
const FULL_TEXT = [...INTRO_PHRASES, "Works"].join(" ");

/**
 * WORKS — reveal + pinned letter-to-image scatter + explosión + reforma
 * (Lite: GSAP + ScrollTrigger, sin plugins pagos).
 * 1. Frases en rotación que terminan asentándose en "WORKS" (reveal simple).
 * 2. Pin: cada letra se apaga y una miniatura aparece en un offset aleatorio,
 *    en orden random. Cada miniatura nueva queda por encima de las
 *    anteriores (z-index por orden de aparición, sin conflictos).
 * 3. "Explosión" suave: las miniaturas se alejan un poco más, sin golpes.
 * 4. Vuelven a su lugar y "WORKS" se reforma; al terminar el timeline el pin
 *    se libera y el scroll sigue normal.
 * Respeta prefers-reduced-motion (muestra "WORKS" estático, sin pin).
 */
export default function Works() {
  const sectionRef = useRef<HTMLElement>(null);
  const phraseRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const wordRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const mediaRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const word = wordRef.current;
    if (!section || !word) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const phrases = phraseRefs.current.filter(
        (el): el is HTMLSpanElement => el !== null,
      );
      const letters = letterRefs.current.filter(
        (el): el is HTMLSpanElement => el !== null,
      );
      const media = mediaRefs.current.filter(
        (el): el is HTMLDivElement => el !== null,
      );

      gsap.set(phrases, { autoAlpha: 0, y: 24 });
      gsap.set(word, { autoAlpha: 0 });
      gsap.set(media, { autoAlpha: 0, scale: 0.4 });

      // Punto de dispersión de cada miniatura. Rotación más angosta para que
      // no termine visualmente lejos de la letra donde apareció.
      const scatter = media.map(() => ({
        x: gsap.utils.random(-70, 70),
        y: gsap.utils.random(-60, 60),
        rotate: gsap.utils.random(-10, 10),
      }));
      media.forEach((el, i) => gsap.set(el, scatter[i]));

      // Orden aleatorio de aparición; cada miniatura nueva queda arriba de
      // las anteriores, así nunca hay conflictos de z-index.
      const appearOrder = gsap.utils.shuffle(media.map((_, i) => i));
      appearOrder.forEach((i, rank) => gsap.set(media[i], { zIndex: rank + 1 }));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=340%",
          pin: true,
          scrub: 1,
        },
      });

      // Fase 1 — frases en rotación, reveal simple.
      phrases.forEach((phrase) => {
        tl.to(phrase, { autoAlpha: 1, y: 0, duration: 0.5 }).to(
          phrase,
          { autoAlpha: 0, y: -24, duration: 0.4 },
          "+=0.3",
        );
      });
      tl.to(word, { autoAlpha: 1, duration: 0.5 });

      // Fase 2 — cada letra se convierte en una miniatura, orden aleatorio.
      appearOrder.forEach((i) => {
        tl.to(
          letters[i],
          { autoAlpha: 0, scale: 0.6, duration: 0.4 },
          "+=0.15",
        ).to(
          media[i],
          { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
          "<",
        );
      });

      // Fase 3 — "explosión" suave: se alejan un poco más, sin golpes bruscos.
      tl.addLabel("explode", "+=0.2");
      media.forEach((el, i) => {
        tl.to(
          el,
          {
            x: scatter[i].x * 1.6,
            y: scatter[i].y * 1.6,
            rotate: scatter[i].rotate * 1.4,
            duration: 0.7,
            ease: "sine.inOut",
          },
          `explode+=${i * 0.05}`,
        );
      });

      // Fase 4 — vuelven a su lugar y "WORKS" se reforma; el pin se libera al
      // terminar el timeline y el scroll continúa normal.
      const reformOrder = gsap.utils.shuffle(media.map((_, i) => i));
      tl.addLabel("reform", "+=0.3");
      reformOrder.forEach((i, rank) => {
        tl.to(
          media[i],
          {
            autoAlpha: 0,
            scale: 0.4,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 0.45,
            ease: "power2.inOut",
          },
          `reform+=${rank * 0.12}`,
        ).to(
          letters[i],
          { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" },
          "<+0.1",
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="works"
      ref={sectionRef}
      aria-label="Works"
      className="relative min-h-[100dvh] overflow-hidden bg-bg"
    >
      <span className="sr-only">{FULL_TEXT}</span>

      <div className="absolute inset-0 flex items-center justify-center px-6">
        {INTRO_PHRASES.map((text, i) => (
          <span
            key={text}
            ref={(el) => {
              phraseRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="absolute opacity-0 text-center font-sans font-semibold tracking-tight text-fg text-[clamp(2rem,6vw,4.5rem)]"
          >
            {text}
          </span>
        ))}

        <div ref={wordRef} className="relative flex items-center justify-center">
          {WORD.split("").map((char, i) => (
            <span key={char + i} className="relative mx-1 inline-block sm:mx-2">
              <span
                ref={(el) => {
                  letterRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="inline-block font-sans font-extrabold tracking-tight text-fg text-[clamp(3rem,12vw,9rem)]"
              >
                {char}
              </span>
              <div
                ref={(el) => {
                  mediaRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[clamp(4.5rem,14vw,8rem)] w-[clamp(4.5rem,14vw,8rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white/5 opacity-0"
              >
                {PROJECTS[i] ? (
                  <img
                    src={PROJECTS[i].src}
                    alt={PROJECTS[i].alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}