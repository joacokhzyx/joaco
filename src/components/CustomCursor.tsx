"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, summary";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    let rafId = 0;

    const updateHoverState = (target: EventTarget | null) => {
      const hovered = target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;
      ring.classList.toggle("is-hover", hovered);
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      rafId = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
      updateHoverState(event.target);
    };

    const onPointerOver = (event: PointerEvent) => updateHoverState(event.target);
    const onPointerOut = () => ring.classList.remove("is-hover");

    dot.style.opacity = "0";
    ring.style.opacity = "0";
    rafId = window.requestAnimationFrame(animate);

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}