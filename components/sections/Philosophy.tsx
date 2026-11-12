"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal, ScrollWords } from "@/components/framer/motion-kit";

export function Philosophy() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const wash = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "50%", "100%"]);
  return (
    <section ref={ref} className="relative overflow-hidden bg-white py-32 md:py-52">
      {/* blue → white wipe that tracks scroll */}
      <motion.div aria-hidden style={{ height: wash }} className="absolute inset-x-0 top-0 bg-[linear-gradient(180deg,#315bdb_0%,#dce6ff_100%)] opacity-[0.10]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <Reveal><p className="eyebrow mb-8 text-blue">Our philosophy</p></Reveal>
        <ScrollWords
          from={0.15}
          className="display max-w-6xl text-[clamp(2.2rem,6.2vw,6rem)] uppercase text-navy"
          text="We don't believe your budget should decide whether your idea deserves to exist."
        />
        <Reveal delay={0.1}>
          <p className="mt-12 max-w-2xl text-xl leading-relaxed text-ink/75 md:text-2xl md:leading-relaxed">
            Traditional pricing can make digital services feel out of reach. We want to try something different. Talk to us, tell us what you dream of building, and let&apos;s see what we can make happen.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
