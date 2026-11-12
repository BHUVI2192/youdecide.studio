"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/config";
import { useLenis } from "@/hooks/useLenis";
import { Logo } from "@/components/ui/Logo";
import { EASE } from "@/components/framer/motion-kit";

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 40));
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) lenis?.stop();
    else lenis?.start();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open, lenis]);

  const light = !solid && !open;
  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          solid || open ? "bg-white/80 shadow-[0_1px_0_rgba(16,26,53,0.08)] backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[72px] md:px-8">
          <a href="#top" aria-label="youdecide.studio — home" className="shrink-0">
            <Logo variant={light ? "white" : "colour"} className="h-[22px] md:h-6" />
          </a>
          <ul className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className={`text-[15px] font-medium transition-colors ${light ? "text-white/90 hover:text-white" : "text-ink/70 hover:text-blue"}`}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`hidden rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:inline-block ${
                light ? "bg-white text-navy" : "bg-navy text-white"
              }`}
            >
              Let&apos;s Talk
            </motion.a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
              className={`grid h-11 w-11 place-items-center rounded-full lg:hidden ${light ? "text-white" : "text-navy"}`}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="menu"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-40 bg-white px-6 pt-24 lg:hidden"
          >
            <ul className="flex flex-col">
              {NAV.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, ease: EASE, duration: 0.6 }}>
                  <a href={n.href} onClick={() => setOpen(false)} className="display block border-b border-navy/10 py-4 text-4xl text-navy">
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a href="#contact" onClick={() => setOpen(false)} className="mt-8 block rounded-full bg-blue py-4 text-center text-lg font-semibold text-white">
              Let&apos;s Talk
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
