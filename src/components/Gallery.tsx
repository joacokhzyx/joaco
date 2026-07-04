// src/components/Gallery.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InertiaPlugin } from "gsap/InertiaPlugin";

const TOTAL = 35;
const IMAGES = Array.from(
  { length: TOTAL },
  (_, i) => `/${String(i + 1).padStart(3, "0")}.jpg`,
);

// 4 bandas de profundidad: escala (tamaño), velocidad de drift y desenfoque
const LANES = [
  { scale: 0.55, speed: 0.5, blur: 2.5, z: 1 },
  { scale: 0.75, speed: 0.72, blur: 1.2, z: 2 },
  { scale: 1.0, speed: 1.0, blur: 0, z: 3 },
  { scale: 1.3, speed: 1.35, blur: 0, z: 4 },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const laneRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    gsap.registerPlugin(ScrollTrigger, InertiaPlugin);

    const ctx = gsap.context(() => {
      const lanes = laneRefs.current.filter((el): el is HTMLDivElement => !!el);

      // ---- Efecto 083: drift multi-carril con pin + scrub ----
      if (!reduce) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + window.innerHeight * 3.2, // largo del recorrido
            pin,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Cada carril tiene distinto ancho => se traslada distinto => distinta velocidad
        lanes.forEach((lane) => {
          tl.fromTo(
            lane,
            { x: 0 },
            { x: () => -(lane.offsetWidth - window.innerWidth), ease: "none" },
            0, // todos arrancan a la vez
          );
        });
      }

      // ---- Efecto 000: inercia al hover ----
      if (fine) {
        let oldX = 0, oldY = 0, dx = 0, dy = 0;
        const onMove = (e: MouseEvent) => {
          dx = e.clientX - oldX;
          dy = e.clientY - oldY;
          oldX = e.clientX;
          oldY = e.clientY;
        };
        section.addEventListener("mousemove", onMove);

        const medias = gsap.utils.toArray<HTMLElement>(".media", section);
        const offs: Array<() => void> = [];
        medias.forEach((el) => {
          const onEnter = () => {
            const power = Number(el.dataset.power) || 30;   // 👈 inercia según profundidad
            el.style.zIndex = "50";
            const tl = gsap.timeline({ onComplete: () => { tl.kill(); el.style.zIndex = ""; } });
            tl.timeScale(1.2);
            tl.to(el, {
              inertia: {
                x: { velocity: dx * power, end: 0 },
                y: { velocity: dy * power, end: 0 },
              },
            });
            tl.fromTo(el, { rotate: 0 }, {
              duration: 0.4,
              rotate: (Math.random() - 0.5) * (power * 0.7), // atrás rota menos
              yoyo: true, repeat: 1, ease: "power1.inOut",
            }, "<");
          };
          el.addEventListener("mouseenter", onEnter);
          offs.push(() => el.removeEventListener("mouseenter", onEnter));
        });

        return () => {
          section.removeEventListener("mousemove", onMove);
          offs.forEach((off) => off());
        };
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Galería"
      className="relative overflow-x-clip bg-bg"
    >
      <div ref={pinRef} className="relative h-[100dvh] w-full overflow-hidden">

        {LANES.map((lane, li) => {
          // reparte las imágenes entre carriles (round-robin)
          const items = IMAGES.filter((_, idx) => idx % LANES.length === li);
          // carril más rápido => más ancho => se traslada más
          const laneWidthVw = 130 + lane.speed * 150;

          return (
            <div key={li} className="absolute inset-0" style={{ zIndex: lane.z }}>
              <div
                ref={(el) => { laneRefs.current[li] = el; }}
                className="relative h-full will-change-transform"
                style={{ width: `${laneWidthVw}vw` }}
              >
                {items.map((src, k) => {
                  // posición pseudo-aleatoria PERO estable (evita mismatch de hidratación)
                  const seed = (li * 97 + k * 131) % 100;
                  const top = 5 + ((seed * 7) % 74);
                  const left = (k / items.length) * (laneWidthVw - 28) + (seed % 10);
                  const w = 11 * lane.scale + (seed % 4);
                  return (
                    <div
                      key={src}
                      className="media absolute overflow-hidden rounded-xl shadow-2xl shadow-black/40 ring-1 ring-white/10"
                      data-power={Math.round(lane.scale * 30)}
                      style={{
                        top: `${top}%`,
                        left: `${left}vw`,
                        width: `${w}vw`,
                        aspectRatio: "4 / 5",
                        filter: lane.blur ? `blur(${lane.blur}px)` : undefined,
                      }}
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}