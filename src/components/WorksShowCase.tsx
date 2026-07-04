// src/components/WorksShowcase.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

type WorkItem = {
  title: string;
  tags: string[];
  image: string;
  alt: string;
  href: string;
  color: string; // color de marca que inunda el fondo en hover
  ink: string;   // color de texto/detalle legible sobre ese fondo
};

// Estado en reposo: gris editorial cálido (cambialo por bg oscuro si preferís)
const REST_BG = "#0a0a0b";
const REST_INK = "#e7e5e0";

const WORKS: WorkItem[] = [
  { title: "Agroecología", tags: ["Investigación", "Producto", "IA"], image: "/001.jpg", alt: "Vista previa de Agroecología", href: "#", color: "#43c26d", ink: "#241a00" },
  { title: "Regen",   tags: ["Ingeniería", "IA", "Investigación"],           image: "/Regen_Image.png", alt: "Vista previa del proyecto 2",  href: "#", color: "#ffc73a", ink: "#241a00" },
  { title: "Proteus",   tags: ["Ingeniería", "IA", "Investigación"],                image: "/Proteus_Image.png", alt: "Vista previa del proyecto 3",  href: "#", color: "#1f6feb", ink: "#eaf1ff" },
];

export default function WorksShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [canHover, setCanHover] = useState(false);
  const moveRef = useRef<((v: number) => void) | null>(null);

  // Capacidad de hover + parallax suave del preview
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    const el = parallaxRef.current;
    if (!el) return;
    moveRef.current = gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" });
  }, []);

  // El fondo se inunda con el color del proyecto activo
  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(bg, {
      backgroundColor: active === null ? REST_BG : WORKS[active].color,
      duration: reduce ? 0 : 0.6,
      ease: "power2.out",
      overwrite: true,
    });
  }, [active]);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!canHover || !moveRef.current) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relY = (e.clientY - rect.top) / rect.height - 0.5; // -0.5..0.5
    moveRef.current(relY * 60); // deriva vertical sutil
  };

  const ink = active === null ? REST_INK : WORKS[active].ink;

  return (
    <section
      id="works"
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setActive(null)}
      aria-label="Selected works"
      className="relative min-h-[100dvh] overflow-x-clip"
    >
      {/* Fondo que cambia de color */}
      <div ref={bgRef} aria-hidden="true" className="absolute inset-0 -z-10" style={{ backgroundColor: REST_BG }} />

      {/* Encabezado: etiqueta + contador */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-8 font-ui text-sm transition-colors duration-500 sm:px-12 lg:px-16"
        style={{ color: ink, opacity: 0.65 }}
      >
      </div>

      {/* Preview anclado a la derecha */}
      {canHover && (
        <div className="pointer-events-none absolute right-[4vw] top-1/2 z-10 hidden -translate-y-1/2 lg:block">
          <div ref={parallaxRef} className="will-change-transform">
            <div
              className="relative h-[46vh] w-[34vw] max-w-[560px] overflow-hidden rounded-[14px] shadow-2xl shadow-black/25 ring-1 ring-black/10 transition-all duration-500 ease-out"
              style={{
                opacity: active === null ? 0 : 1,
                transform: active === null ? "translateX(48px) scale(0.96)" : "translateX(0) scale(1)",
                clipPath: active === null ? "inset(10% 0 10% 0 round 14px)" : "inset(0% 0 0% 0 round 14px)",
              }}
            >
              {WORKS.map((work, i) => (
                <img
                  key={work.title}
                  src={work.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out"
                  style={{ opacity: active === i ? 1 : 0, transform: `scale(${active === i ? 1.05 : 1})` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de proyectos */}
      <ul className="relative z-20 flex min-h-[100dvh] flex-col justify-center px-6 sm:px-12 lg:px-16 lg:pr-[42vw]">
        {WORKS.map((work, i) => {
          const isActive = active === i;
          const dimmed = active !== null && !isActive;
          const showTags = isActive || !canHover;
          return (
            <li
              key={work.title}
            >
              <a
                href={work.href}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group block py-[2vh] no-underline outline-none"
                style={{ color: ink }}
              >
                <div className="flex items-baseline gap-4 sm:gap-6">
                  <span
                    className="hidden w-10 shrink-0 font-ui text-sm tabular-nums transition-opacity duration-300 sm:block"
                    style={{ opacity: dimmed ? 0.3 : 0.5 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span
                    className="font-sans font-medium leading-[0.95] tracking-[-0.02em] text-[clamp(2.4rem,7vw,6rem)] transition-[opacity,transform] duration-500 ease-out"
                    style={{
                      opacity: dimmed ? 0.32 : 1,
                      transform: isActive ? "translateX(14px)" : "translateX(0)", }}
                    
                  >
                    {work.title}
                  </span>

                  <span
                    className="ml-auto hidden shrink-0 text-2xl transition-[transform,opacity] duration-500 ease-out group-hover:translate-x-1 sm:block"
                    style={{ opacity: isActive ? 1 : 0 }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="h-6 w-6"
                    >
                      <path
                        d="M7 17L17 7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 7H17V14"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>

                {/* Tags: se despliegan con animación de altura (grid 0fr → 1fr) */}
                <div
                  className="grid transition-all duration-500 ease-out"
                  style={{ gridTemplateRows: showTags ? "1fr" : "0fr", opacity: showTags ? 1 : 0 }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex flex-wrap gap-2 pt-3 sm:pl-16">
                      {work.tags.map((tag) => (
                        <span
                          key={tag}
                          className="whitespace-nowrap rounded-full border px-3 py-1 font-ui text-[0.7rem]"
                          style={{ borderColor: `${ink}40`, color: ink }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}