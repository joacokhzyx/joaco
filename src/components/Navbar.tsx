"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import RollLink from "./RollLink";
import MegaMenu from "./MegaMenu";

const LINKS = [
  { href: "#education", label: "Education" },
  { href: "#works", label: "Works" },
  { href: "#contact", label: "Contact" },
];

function PixelMenuIcon({ open, className }: { open: boolean; className?: string }) {
  const menu = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
    [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
    [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
  ];
  const close = [
    [0, 0], [1, 1], [2, 2], [3, 3], [4, 4],
    [0, 4], [1, 3], [3, 1], [4, 0],
  ];
  const squares = open ? close : menu;

  return (
    <svg viewBox="0 0 25 25" fill="currentColor" aria-hidden="true" className={className}>
      {squares.map(([c, r], i) => (
        <rect key={i} x={c * 5} y={r * 5} width={4} height={4} />
      ))}
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          isScrolled || menuOpen ? "bg-black/90" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-12 lg:px-16">
          <a href="#" aria-label="Joaco — Home" className="inline-flex text-fg">
            <Logo className="h-[22px] w-auto" />
          </a>
          <nav
            aria-label="Primary"
            className="flex items-center gap-4 sm:gap-6 lg:gap-8"
          >
            {LINKS.map((link) => (
              <RollLink key={link.href} href={link.href} label={link.label} />
            ))}

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mega-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="inline-flex items-center gap-2 font-ui text-base tracking-wide text-fg/80 transition hover:text-fg"
            >
              <PixelMenuIcon open={menuOpen} className="h-5 w-5 text-fg" />
            </button>
          </nav>
        </div>
      </header>

      <MegaMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
