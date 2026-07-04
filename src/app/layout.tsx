import type { Metadata } from "next";
import { Urbanist, Outfit, Chelsea_Market, Fraunces } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const chelseaMarket = Chelsea_Market({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-chelsea",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Joaco | AI Researcher & Full-Stack Developer",
    template: "%s | Joaco",
  },
  description: "Think deeper. Build better.",
  keywords: [
    "Joaco",
    "AI Researcher",
    "Full-Stack Developer",
    "Portfolio",
    "Frontend",
    "React",
    "Next.js",
  ],
  authors: [{ name: "Joaco" }],
  creator: "Joaco",
  publisher: "Joaco",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Joaco | AI Researcher & Full-Stack Developer",
    description: "Think deeper. Build better.",
    url: "/",
    siteName: "Joaco",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "Joaco portfolio banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joaco | AI Researcher & Full-Stack Developer",
    description: "Think deeper. Build better.",
    images: ["/banner.png"],
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${outfit.variable} ${chelseaMarket.variable} ${fraunces.variable}`}
    >
      <body className="bg-bg text-fg font-sans antialiased">
        <CustomCursor />
        <Loader />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
