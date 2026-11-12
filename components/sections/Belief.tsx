"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal, ScrollWords } from "@/components/framer/motion-kit";

export function Belief() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const orbY = useTransform(scrollYProgress, [0, 1], ["10%", "-25%"]);
  return (
    <section id="belief" ref={ref} className="relative overflow-hidden bg-white py-28 md:py-44">
      <motion.div
        aria-hidden
        style={{ y: orbY }}
        className="pointer-events-none absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_30%_30%,#dce6ff,rgba(220,230,255,0)_68%)]"
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <Reveal><p className="eyebrow mb-8 text-blue">The belief</p></Reveal>
        <ScrollWords
          from={0.12}
          className="display max-w-5xl text-[clamp(2.4rem,6.4vw,5.5rem)] text-navy"
          text="Who decided that good ideas need big budgets?"
        />
        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-12">
          <Reveal className="md:col-span-6 md:col-start-1">
            <p className="text-xl leading-relaxed text-ink/75 md:text-2xl md:leading-relaxed">
              Not everyone is backed by investors. Not everyone runs a big company. Sometimes it&apos;s just one person with an idea and the courage to start. We believe that deserves a chance.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5 md:col-start-8">
            <div className="rounded-3xl bg-sky p-8 md:p-10">
              <p className="display text-3xl text-blue-deep md:text-4xl">
                Your idea matters. Not the size of your wallet.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
