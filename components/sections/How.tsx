"use client";
import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { Reveal, EASE } from "@/components/framer/motion-kit";

const STEPS = [
  { n: "01", t: "Bring your idea.", d: "Tell us what you want to create. No idea is too small." },
  { n: "02", t: "Let's figure it out.", d: "We discuss your requirements, scope, timeline and expectations." },
  { n: "03", t: "We build.", d: "We create and deliver the agreed work with care." },
  { n: "04", t: "You decide.", d: "Experience the result and contribute what you believe the work is worth." },
] as const;

export function How() {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  return (
    <section id="how" className="overflow-x-clip bg-[#f6f9ff] py-28 md:py-44">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="md:sticky md:top-32">
              <Reveal><p className="eyebrow mb-6 text-blue">How it works</p></Reveal>
              <Reveal><h2 className="display text-[clamp(2.6rem,5.5vw,4.75rem)] text-navy">Simple. Transparent. Different.</h2></Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink/70">
                  Domains, hosting, paid APIs and other third-party subscriptions may be billed separately. We&apos;ll always tell you before we start.
                </p>
              </Reveal>
            </div>
          </div>
          <div className="md:col-span-7">
            <ol ref={list} className="relative">
              <span aria-hidden className="absolute bottom-6 left-[27px] top-6 w-px bg-navy/10" />
              <motion.span aria-hidden style={{ scaleY }} className="absolute bottom-6 left-[27px] top-6 w-px origin-top bg-blue" />
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                  transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
                  className={`relative flex gap-6 md:gap-8 ${i ? "mt-14 md:mt-20" : ""}`}
                >
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-navy/10 bg-white font-mono text-sm font-medium text-blue shadow-sm">
                    {s.n}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="display text-[clamp(1.8rem,3.2vw,2.75rem)] text-navy">{s.t}</h3>
                    <p className="mt-3 max-w-md text-lg leading-relaxed text-ink/70">{s.d}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
