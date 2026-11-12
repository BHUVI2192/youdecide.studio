"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { SITE } from "@/lib/config";
import { EASE } from "@/components/framer/motion-kit";
import { PillLink } from "@/components/ui/PillLink";

const LINES = ["Big dreams.", "Small budgets."];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } };
const rise = { hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1.1, ease: EASE } } };
const fade = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } };

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const cloudY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const textO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section id="top" ref={ref} className="relative isolate flex min-h-svh items-center overflow-hidden">
      {/* sky: parallax layers */}
      <motion.div aria-hidden style={{ y: skyY }} className="absolute inset-x-0 -top-[6%] -bottom-[6%] -z-30">
        <Image src="/images/hero-sky.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[60%_50%]" />
      </motion.div>
      <motion.div aria-hidden style={{ y: cloudY }} className="absolute inset-x-0 bottom-0 -z-20 h-[55%] overflow-hidden opacity-90">
        <div
          className="drift absolute inset-y-0 left-0 w-[200%] bg-repeat-x"
          style={{ backgroundImage: "url(/images/clouds-drift.png)", backgroundSize: "50% 100%" }}
        />
      </motion.div>
      {/* readability + airy fade into the next section */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(95deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.28)_46%,rgba(255,255,255,0)_75%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-white" />

      <motion.div style={{ y: textY, opacity: textO }} className="mx-auto w-full max-w-7xl px-5 pb-28 pt-32 md:px-8">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl">
          <motion.p variants={fade} className="eyebrow mb-6 text-blue-deep md:mb-8">
            The internet is for everyone.
          </motion.p>

          <h1 className="display text-[clamp(3rem,9.2vw,8.25rem)] text-navy">
            {LINES.map((l) => (
              <span key={l} className="block overflow-hidden pb-[0.06em]">
                <motion.span variants={rise} className="block">{l}</motion.span>
              </span>
            ))}
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={rise} className="shine block">No problem.</motion.span>
            </span>
          </h1>

          <motion.p variants={fade} className="mt-8 max-w-xl text-lg leading-relaxed text-navy/80 md:text-xl">
            Have an idea but worried about the price? Bring it to us. We&apos;ll talk through it, build what makes sense, and let you decide what our work is worth.
          </motion.p>

          <motion.div variants={fade} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PillLink href="#contact">
              Tell us your idea
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </PillLink>
            <PillLink href={SITE.calendly} variant="secondary" external>
              <CalendarDays size={18} /> Book a 30-minute call
            </PillLink>
          </motion.div>
        </motion.div>
      </motion.div>

      <a href="#belief" aria-label="Scroll to the next section" className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-navy/70 md:flex">
        <span className="eyebrow text-[10px]">Scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-navy/20">
          <span className="scrollcue absolute inset-x-0 top-0 block h-4 bg-navy" />
        </span>
      </a>
    </section>
  );
}
