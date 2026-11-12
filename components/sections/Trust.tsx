"use client";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { ArrowUpRight, Heart } from "lucide-react";
import { inr, dateShort } from "@/lib/format";
import type { PublicEntry } from "@/types";
import { Reveal, EASE } from "@/components/framer/motion-kit";


type Sort = "amount" | "latest";

export function Trust({ entries, demo }: { entries: PublicEntry[]; demo: boolean }) {
  const [sort, setSort] = useState<Sort>("amount");
  const rows = useMemo(
    () =>
      [...entries].sort((a, b) =>
        sort === "amount" ? b.amount - a.amount || +new Date(b.created_at) - +new Date(a.created_at) : +new Date(b.created_at) - +new Date(a.created_at),
      ),
    [entries, sort],
  );

  return (
    <section id="trust" className="relative overflow-hidden bg-navy py-28 text-white on-dark md:py-44">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(49,91,219,0.45),rgba(49,91,219,0)_70%)]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <Reveal><p className="eyebrow mb-6 text-sky">Transparency</p></Reveal>
        <Reveal><h2 className="display text-[clamp(2.6rem,7vw,6.5rem)]">The Wall of Trust.</h2></Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">
            Real projects. Real people. Real contributions. Every contribution represents someone who believed in what we built together.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-14">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur">
            <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
              <p className="font-mono text-xs tracking-widest text-white/60">
                {rows.length ? `${rows.length} CONTRIBUTION${rows.length === 1 ? "" : "S"}` : "LEADERBOARD"}
                {demo && <span className="ml-3 rounded-full bg-amber-300/20 px-2 py-0.5 text-amber-200">DEMO DATA · NOT REAL CUSTOMERS</span>}
              </p>
              <div role="group" aria-label="Sort leaderboard" className="relative flex rounded-full bg-white/10 p-1 text-sm">
                {(["amount", "latest"] as Sort[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={sort === s}
                    onClick={() => setSort(s)}
                    className={`relative z-10 rounded-full px-4 py-1.5 font-medium transition-colors ${sort === s ? "text-navy" : "text-white/80 hover:text-white"}`}
                  >
                    {sort === s && (
                      <motion.span layoutId="sort-pill" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} className="absolute inset-0 -z-10 rounded-full bg-white" />
                    )}
                    {s === "amount" ? "By contribution" : "Latest"}
                  </button>
                ))}
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="px-6 py-20 text-center md:py-28">
                <Heart className="mx-auto text-sky" size={28} />
                <p className="display mt-6 text-3xl md:text-4xl">The wall is waiting for its first story.</p>
                <p className="mx-auto mt-4 max-w-md text-white/70">
                  Contributions appear here only after a customer explicitly agrees to be listed. Yours could be the first.
                </p>
              </div>
            ) : (
              <LayoutGroup>
                <div className="hidden grid-cols-[3rem_1fr_1fr_10rem_3rem] gap-4 px-7 py-3 font-mono text-[11px] tracking-widest text-white/45 md:grid">
                  <span>RANK</span><span>CUSTOMER</span><span>PROJECT</span><span className="text-right">CONTRIBUTION</span><span />
                </div>
                <ol className="divide-y divide-white/10">
                  <AnimatePresence initial={false}>
                    {rows.map((r, i) => (
                      <motion.li
                        key={r.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ layout: { type: "spring", bounce: 0.15, duration: 0.7 }, duration: 0.3 }}
                        className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-5 py-4 md:grid-cols-[3rem_1fr_1fr_10rem_3rem] md:gap-4 md:px-7 md:py-5"
                      >
                        <span className="font-mono text-sm text-sky">{String(i + 1).padStart(2, "0")}</span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold md:text-lg">
                            {r.display_name}
                            {r.demo && <span className="ml-2 font-mono text-[10px] text-amber-200">DEMO</span>}
                          </p>
                          <p className="truncate text-sm text-white/60 md:hidden">{r.project_name || r.service_type}</p>
                        </div>
                        <div className="hidden min-w-0 md:block">
                          <p className="truncate text-white/85">{r.project_name || r.service_type}</p>
                          <p className="truncate text-sm text-white/50">{r.project_name ? r.service_type : dateShort(r.created_at)}</p>
                        </div>
                        <p className="text-right font-mono text-base font-medium tabular-nums md:text-lg">{inr(r.amount)}</p>
                        <span className="hidden justify-end md:flex">
                          {r.link_url && (
                            <a href={r.link_url} target="_blank" rel="noopener noreferrer nofollow" aria-label={`Visit ${r.display_name}`} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white hover:text-navy">
                              <ArrowUpRight size={16} />
                            </a>
                          )}
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ol>
              </LayoutGroup>
            )}
          </div>
        </Reveal>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          className="mt-8 max-w-xl text-white/60"
        >
          Every project has its own story. Every contribution is appreciated, regardless of its size.
        </motion.p>
      </div>
    </section>
  );
}
