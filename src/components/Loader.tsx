"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import Logo from "./Logo";

const ROWS = [0, 1, 2];

/**
 * Loading overlay:
 * - Three stacked JOACO rows doing a stepped horizontal "roll" (bezier eased),
 *   each row progressively staggered, looping until the page is ready.
 * - On reveal: side rows fade out, the middle row snaps to a centered logo and
 *   zooms into the "A" (transform-origin ~47% 50%) while the overlay dissolves.
 * - Locks scrolling while active and respects prefers-reduced-motion.
 */
export default function Loader() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const finish = () => {
      html.style.overflow = prevOverflow;
      overlay.style.display = "none";
      window.dispatchEvent(new Event("loader:done"));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    gsap.registerPlugin(CustomEase);
    // Hand-tuned beziers (x1, y1, x2, y2):
    const rollEase = CustomEase.create("loaderRoll", "0.85, 0, 0.15, 1"); // crisp stepped roll
    const zoomEase = CustomEase.create("loaderZoom", "0.7, 0, 0.84, 0"); // accelerate INTO the "A"
    const fadeEase = CustomEase.create("loaderFade", "0.33, 1, 0.68, 1"); // smooth settle

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
      const tracks = gsap.utils.toArray<HTMLElement>("[data-track]");

      // Stepped horizontal roll: each row rolls one logo, holds, loops.
      // Per-row delay = progressive; the bezier gives it the detail.
      const loops = tracks.map((track, i) =>
        gsap.fromTo(
          track,
          { xPercent: 0 },
          {
            xPercent: -50,
            duration: 0.7,
            ease: rollEase,
            repeat: -1,
            repeatDelay: 0.45,
            delay: i * 0.2,
          },
        ),
      );

      let revealed = false;
      const reveal = () => {
        if (revealed) return;
        revealed = true;

        const mid = rows[1];
        const midTrack = tracks[1];
        const sides = [rows[0], rows[2]];

        // Snap the middle row to the nearest whole logo to keep the "A" aligned.
        const current = (gsap.getProperty(midTrack, "xPercent") as number) ?? 0;
        const snap = current < -25 ? -50 : 0;
        loops.forEach((l) => l.kill());

        const tl = gsap.timeline({ onComplete: finish });
        tl.to(sides, { autoAlpha: 0, duration: 0.4, ease: fadeEase }, 0)
          .to(midTrack, { xPercent: snap, duration: 0.5, ease: rollEase }, 0)
          .to(
            mid,
            {
              scale: 9,
              transformOrigin: "47% 50%",
              duration: 1.1,
              ease: zoomEase,
            },
            ">-0.05",
          )
          .to(overlay, { autoAlpha: 0, duration: 0.6, ease: fadeEase }, "<0.45");
      };

      const ready = new Promise<void>((res) => {
        if (document.readyState === "complete") res();
        else window.addEventListener("load", () => res(), { once: true });
      });
      const minTime = new Promise<void>((res) => window.setTimeout(res, 2200));
      Promise.all([ready, minTime]).then(reveal);
    }, overlay);

    return () => {
      ctx.revert();
      html.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] grid place-items-center bg-bg"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        {ROWS.map((row) => (
          <div
            key={row}
            data-row
            className="w-[min(70vw,520px)] overflow-hidden"
          >
            <div data-track className="flex w-max">
              <div className="w-[min(70vw,520px)] shrink-0">
                <Logo className="h-auto w-full text-fg" />
              </div>
              <div className="w-[min(70vw,520px)] shrink-0">
                <Logo className="h-auto w-full text-fg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}