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
  title: "Joaco — AI Researcher & Full-Stack Developer",
  description: "Think deeper. Build better.",
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
