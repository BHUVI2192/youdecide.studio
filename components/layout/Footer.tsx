"use client";
import { motion } from "motion/react";
import { CalendarDays, Mail, AtSign, Briefcase } from "lucide-react";
import { NAV, SITE } from "@/lib/config";
import { Logo } from "@/components/ui/Logo";
import { EASE } from "@/components/framer/motion-kit";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 1, ease: EASE }}
      className="border-t border-navy/10 bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo variant="colour" className="h-6" />
            <p className="mt-6 max-w-sm text-ink/70">Not another agency. No price tag. No gatekeeping. You dream, we build, you decide.</p>
            <p className="display mt-8 text-2xl text-navy">Made for the ideas that deserve a chance.</p>
          </div>
          <nav aria-label="Footer" className="md:col-span-3">
            <p className="eyebrow mb-5 text-blue">Explore</p>
            <ul className="space-y-3">
              {NAV.map((n) => (
                <li key={n.href}><a href={n.href} className="text-ink/75 transition hover:text-blue">{n.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-4">
            <p className="eyebrow mb-5 text-blue">Say hello</p>
            <ul className="space-y-3">
              {SITE.email ? (
                <li><a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 text-ink/75 transition hover:text-blue"><Mail size={16} /> {SITE.email}</a></li>
              ) : (
                <li className="inline-flex items-center gap-2 text-ink/50"><Mail size={16} /> Email coming soon</li>
              )}
              <li><a href={SITE.calendly} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-ink/75 transition hover:text-blue"><CalendarDays size={16} /> Book a 30-minute call</a></li>
              <li>
                <a href={SITE.instagram || "#"} target={SITE.instagram ? "_blank" : undefined} rel="noopener noreferrer" aria-disabled={!SITE.instagram} className={`inline-flex items-center gap-2 transition ${SITE.instagram ? "text-ink/75 hover:text-blue" : "pointer-events-none text-ink/40"}`}>
                  <AtSign size={16} /> Instagram{!SITE.instagram && " · handle coming soon"}
                </a>
              </li>
              <li>
                <a href={SITE.linkedin || "#"} target={SITE.linkedin ? "_blank" : undefined} rel="noopener noreferrer" aria-disabled={!SITE.linkedin} className={`inline-flex items-center gap-2 transition ${SITE.linkedin ? "text-ink/75 hover:text-blue" : "pointer-events-none text-ink/40"}`}>
                  <Briefcase size={16} /> LinkedIn{!SITE.linkedin && " · coming soon"}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-navy/10 pt-6 text-sm text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} youdecide.studio. All rights reserved.</p>
          <p className="font-mono text-xs tracking-widest">PAY WHAT YOU BELIEVE WE&apos;RE WORTH</p>
        </div>
      </div>
    </motion.footer>
  );
}
