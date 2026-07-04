const pillClass =
  "rounded-full border border-white/15 bg-white/[0.02] px-5 py-[9px] font-ui text-sm text-fg no-underline backdrop-blur transition-colors duration-200 hover:border-white hover:bg-white hover:text-black";

export default function Hero() {
  return (
    <>
      <section className="flex flex-1 items-center justify-end text-right max-sm:items-end max-sm:justify-start max-sm:pb-8 max-sm:text-left">
        <h1 className="m-0 font-sans font-semibold leading-[1.02] tracking-[-0.02em] text-[clamp(2.5rem,6.5vw,5rem)] max-sm:text-[clamp(2.25rem,12vw,3.25rem)]">
          Think <span className="font-display font-normal tracking-normal">deeper.</span>
          <br />
          Build better.
        </h1>
      </section>

      <section
        aria-label="Introduction"
        className="flex flex-col items-start gap-6"
      >
        <p className="m-0 font-sans font-medium leading-[1.2] text-[clamp(1.2rem,2.4vw,1.75rem)]">
          AI Researcher &amp;
          <br />
          Full-Stack Developer
        </p>
        <div className="flex gap-3">
          <a href="#contact" className={pillClass}>
            Contact
          </a>
          <a href="#works" className={pillClass}>
            Works
          </a>
        </div>
      </section>
    </>
  );
}
