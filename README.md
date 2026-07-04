# Joaco — Portfolio

Portfolio personal construido con **Next.js (Latest)**, App Router, TypeScript,
**TailwindCSS v4**, **GSAP** y **Lenis**.

> Think deeper. Build better.

## Stack

- **Next.js** (App Router)
- **TypeScript**
- **TailwindCSS v4** (config vía `@theme` en `globals.css`, sin `tailwind.config`)
- **GSAP** para animaciones (roll de navlinks + loader)
- **Lenis** para smooth scroll (sincronizado con el ticker de GSAP)
- **next/font** para Urbanist, Outfit y Chelsea Market
- **next/image** para el hero optimizado

## Requisitos

- Node.js 18.18+ (recomendado 20+)

## Puesta en marcha

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

## Estructura

```
src/
  app/
    layout.tsx        # Fuentes + Loader + SmoothScroll
    page.tsx          # Hero (fondo + overlay)
    globals.css       # Tailwind v4 + tokens (@theme) + Lenis
  components/
    Navbar.tsx        # Logo + navlinks
    RollLink.tsx      # Navlink roll word-progressive (cae de arriba, GSAP)
    Hero.tsx          # Titular + rol + CTAs
    Loader.tsx        # 3 logos en roll horizontal + zoom en la "A" (GSAP)
    SmoothScroll.tsx  # Lenis + GSAP ticker
    Logo.tsx          # Logo SVG inline (currentColor)
public/
  hero.png
  logo.svg
```

## Notas de animación

- **RollLink**: cada letra se apila dos veces; en hover la copia entra **desde
  arriba** con un `stagger` (word-progressive) y **sin cambiar de color**.
- **Loader**: 3 logos en una pista horizontal (roll), y al terminar hace zoom
  con `transform-origin: 47% 50%` (la "A") mientras se disuelve para revelar la
  página. Respeta `prefers-reduced-motion`.
- El loader emite el evento `window` `"loader:done"` por si querés encadenar
  animaciones de entrada del hero.
