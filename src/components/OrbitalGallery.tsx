// src/components/OrbitGallery.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import src from "gsap-trial/src/index";

const TOTAL = 35;
const IMAGES = Array.from(
  { length: TOTAL },
  (_, i) => `/${String(i + 1).padStart(3, "0")}.jpg`,
);
const TURNS = 2; // vueltas totales a lo largo del pin

export default function OrbitGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    gsap.registerPlugin(ScrollTrigger, InertiaPlugin);

    const items = itemRefs.current.filter((el): el is HTMLDivElement => !!el);
    const N = items.length;
    const depths = new Array(N).fill(0.5);
    const step = (Math.PI * 2) / N;
    const interp = gsap.utils.interpolate;

    const ctx = gsap.context(() => {
      let cx = 0, cy = 0, minR = 0;
      const measure = () => {
        const r = stage.getBoundingClientRect();
        cx = r.width / 2;
        cy = r.height / 2;
        minR = Math.min(r.width, r.height);
      };
      measure();

      let targetProg = 0;   // progreso de scroll (0..1)
      let smoothProg = 0;   // suavizado
      let flatten = 0;      // 0 = órbita 3D · 1 = órbita 2D plana
      const state = { boost: 0 };

      const render = () => {
        smoothProg += (targetProg - smoothProg) * 0.08;
        state.boost += (0 - state.boost) * 0.05;

        const rotation = smoothProg * TURNS * Math.PI * 2;
        // luego de orbitar un poco (35%) transiciona a 2D (listo al 75%)
        flatten = gsap.utils.clamp(0, 1, (smoothProg - 0.35) / 0.4);

        const Rbase = minR * 0.34 * (1 + state.boost * 0.28); // velocidad => alejarse
        const Rx = Rbase;
        const Ry = Rbase * interp(0.5, 1, flatten); // elipse (3D) -> círculo (2D)

        for (let i = 0; i < N; i++) {
          const a = rotation + i * step;
          const d = (Math.sin(a) + 1) / 2; // 0 atrás · 1 frente
          depths[i] = d;

          const x = cx + Math.cos(a) * Rx;
          const y = cy + Math.sin(a) * Ry;
          const scale = interp(0.45 + d * 0.85, 0.92, flatten);   // uniforme en 2D
          const opacity = interp(0.35 + d * 0.65, 1, flatten);

          const item = items[i];
          item.style.transform =
            `translate(-50%,-50%) translate(${x}px, ${y}px) scale(${scale})`;
          item.style.opacity = String(opacity);
          item.style.zIndex = String(Math.round(d * 100 * (1 - flatten) + 40 * flatten));

          const card = item.firstElementChild as HTMLElement | null;
          if (card) {
            const blur = (1 - d) * 4 * (1 - flatten); // sin blur en 2D
            card.style.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : "";
          }
        }
      };

      if (reduce) {
        render(); // órbita estática
      } else {
        gsap.ticker.add(render);

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=260%",          // 👈 duración del pin
          pin: stage,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate: (self) => {
            targetProg = self.progress;                              // rotación general
            const v = self.getVelocity();
            state.boost = gsap.utils.clamp(0, 1, Math.abs(v) / 1800); // alejarse del centro
          },
        });
      }

      // Inercia al hover (suave atrás; en 2D todas responden pleno)
      let offHover: (() => void) | undefined;
      if (fine && !reduce) {
        let oldX = 0, oldY = 0, dx = 0, dy = 0;
        const onMove = (e: MouseEvent) => {
          dx = e.clientX - oldX; dy = e.clientY - oldY;
          oldX = e.clientX; oldY = e.clientY;
        };
        section.addEventListener("mousemove", onMove);

        const offs: Array<() => void> = [];
        items.forEach((item, i) => {
          const card = item.firstElementChild as HTMLElement | null;
          if (!card) return;
          const onEnter = () => {
            const eff = interp(depths[i], 1, flatten); // en 2D todas al frente
            const power = 12 + eff * 30;                // atrás suave · frente fuerte
            const tl = gsap.timeline({ onComplete: () => tl.kill() });
            tl.timeScale(1.2);
            tl.to(card, {
              inertia: {
                x: { velocity: dx * power, end: 0 },
                y: { velocity: dy * power, end: 0 },
              },
            });
            tl.fromTo(card, { rotate: 0 }, {
              duration: 0.4,
              rotate: (Math.random() - 0.5) * (10 + eff * 20),
              yoyo: true, repeat: 1, ease: "power1.inOut",
            }, "<");
          };
          item.addEventListener("mouseenter", onEnter);
          offs.push(() => item.removeEventListener("mouseenter", onEnter));
        });
        offHover = () => {
          section.removeEventListener("mousemove", onMove);
          offs.forEach((off) => off());
        };
      }

      const onResize = () => measure();
      window.addEventListener("resize", onResize);

      return () => {
        gsap.ticker.remove(render);
        window.removeEventListener("resize", onResize);
        offHover?.();
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Showcase orbital"
      className="relative overflow-x-clip bg-bg"
    >
      <div ref={stageRef} className="relative h-[100dvh] w-full overflow-hidden">
        <p className="pointer-events-none absolute left-1/2 top-1/2 z-[200] flex -translate-x-1/2 -translate-y-1/2 items-baseline gap-3 whitespace-nowrap font-sans font-semibold tracking-tight text-fg text-[clamp(2rem,5vw,3.5rem)]">
          Showcase <span className="text-fg/50">{TOTAL}</span>
        </p>

        {IMAGES.map((src, i) => (
          <div
            key={src}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="orbit-item absolute left-0 top-0 will-change-transform"
          >
            <div className="media overflow-hidden rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10 will-change-transform">
              <img
                src={src}
                alt=""
                loading="lazy"
                draggable={false}
                className="block h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}