"use client";
import { motion } from "motion/react";
import { Reveal, EASE } from "@/components/framer/motion-kit";

function WebMock() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label="Illustration of a website layout">
      <rect x="20" y="20" width="280" height="160" rx="14" fill="#fff" stroke="#101a35" strokeOpacity=".1" />
      <circle cx="38" cy="38" r="4" fill="#dce6ff" /><circle cx="52" cy="38" r="4" fill="#dce6ff" /><circle cx="66" cy="38" r="4" fill="#dce6ff" />
      <rect x="40" y="62" width="130" height="14" rx="7" fill="#101a35" />
      <rect x="40" y="84" width="96" height="14" rx="7" fill="#315bdb" />
      <rect x="40" y="110" width="150" height="6" rx="3" fill="#101a35" opacity=".15" />
      <rect x="40" y="122" width="120" height="6" rx="3" fill="#101a35" opacity=".15" />
      <rect x="40" y="142" width="64" height="22" rx="11" fill="#315bdb" />
      <rect x="200" y="58" width="80" height="106" rx="10" fill="#dce6ff" />
      <circle cx="240" cy="92" r="16" fill="#fff" />
    </svg>
  );
}
function FlowMock() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label="Illustration of an automated workflow">
      <path d="M70 100 H130 M190 100 H250 M160 70 V40 M160 130 V160" stroke="#315bdb" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 7" />
      <rect x="30" y="78" width="60" height="44" rx="12" fill="#fff" stroke="#101a35" strokeOpacity=".12" />
      <rect x="130" y="78" width="60" height="44" rx="12" fill="#315bdb" />
      <rect x="230" y="78" width="60" height="44" rx="12" fill="#fff" stroke="#101a35" strokeOpacity=".12" />
      <rect x="136" y="20" width="48" height="30" rx="10" fill="#dce6ff" />
      <rect x="136" y="150" width="48" height="30" rx="10" fill="#dce6ff" />
      <path d="M150 100 l8 8 l14 -16" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChartMock() {
  const bars = [46, 72, 58, 96, 80, 118];
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label="Illustration of an analytics chart">
      <rect x="20" y="20" width="280" height="160" rx="14" fill="#fff" stroke="#101a35" strokeOpacity=".1" />
      {bars.map((h, i) => (
        <rect key={i} x={46 + i * 42} y={160 - h} width="24" height={h} rx="7" fill={i === 5 ? "#315bdb" : "#dce6ff"} />
      ))}
      <path d="M50 120 C 95 110, 120 128, 160 96 S 240 70, 276 44" stroke="#101a35" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="276" cy="44" r="5" fill="#101a35" />
    </svg>
  );
}

const SERVICES = [
  { n: "01", title: "Websites", body: "From personal portfolios to business websites and landing pages. We turn your ideas into a digital presence.", Art: WebMock },
  { n: "02", title: "Automation", body: "Less repetitive work. Smarter workflows. More time to focus on what matters.", Art: FlowMock },
  { n: "03", title: "Analytics & Business Intelligence", body: "Make sense of your data. Discover insights. Make better decisions.", Art: ChartMock },
] as const;

export function Build() {
  return (
    <section id="build" className="bg-white pb-28 pt-8 md:pb-44">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal><p className="eyebrow mb-6 text-blue">What we build</p></Reveal>
        <Reveal><h2 className="display max-w-3xl text-[clamp(2.4rem,5.5vw,4.75rem)] text-navy">Three things. Done with care.</h2></Reveal>
        <ul className="mt-14 grid gap-5 md:mt-20 md:grid-cols-3">
          {SERVICES.map(({ n, title, body, Art }, i) => (
            <motion.li
              key={n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: EASE }}
              whileHover={{ y: -8 }}
              className="group flex flex-col overflow-hidden rounded-[28px] border border-navy/10 bg-[#f6f9ff] p-3 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(49,91,219,0.45)]"
            >
              <div className="aspect-[8/5] overflow-hidden rounded-[20px] bg-sky p-3 transition-transform duration-700 group-hover:scale-[1.02]">
                <Art />
              </div>
              <div className="flex flex-1 flex-col p-5 pb-6 md:p-6">
                <span className="font-mono text-xs font-medium tracking-widest text-blue">{n}</span>
                <h3 className="display mt-3 text-[1.9rem] leading-[1.02] text-navy">{title}</h3>
                <p className="mt-4 text-[17px] leading-relaxed text-ink/70">{body}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
