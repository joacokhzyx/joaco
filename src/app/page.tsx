import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ethos from "@/components/Ethos";
import Works from "@/components/Works";
import WorksShowCase from "@/components/WorksShowCase";
import Gallery from "@/components/Gallery";
import Manifesto from "@/components/Manifesto";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main className="relative min-h-[100dvh] bg-black">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <Image
            src="/hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[42%_center] sm:object-center"
          />
          <div className="hero-vignette absolute inset-0" />
        </div>

        <div className="relative z-10 flex min-h-[100dvh] flex-col gap-8 px-6 py-8 sm:px-12 lg:px-16">
          <Navbar />
          <Hero />
        </div>
      </main>
      <Ethos />
      <Manifesto />
      <Works />
      <WorksShowCase />
      <Gallery />
      <Footer />
    </>
  );
}