"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { BUDGET_OPTIONS, CONTACT_METHODS, SERVICE_TYPES, SITE } from "@/lib/config";
import { Reveal, EASE } from "@/components/framer/motion-kit";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "error"; message: string; fields?: Record<string, string> };

const field = "mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3.5 text-base text-navy placeholder:text-navy/40 transition focus:border-blue focus:ring-4 focus:ring-blue/15 focus:outline-none aria-[invalid=true]:border-red-500";
const label = "text-sm font-medium text-navy";

export function Enquiry() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const errs = status.kind === "error" ? status.fields ?? {} : {};

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string> };
      if (res.ok && json.ok) {
        setStatus({ kind: "ok" });
        form.reset();
      } else setStatus({ kind: "error", message: json.error ?? "Something went wrong. Please try again.", fields: json.fields });
    } catch {
      setStatus({ kind: "error", message: "Network error. Please check your connection and try again." });
    }
  }

  return (
    <section id="contact" className="bg-[#f6f9ff] py-28 md:py-44">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <Reveal><p className="eyebrow mb-6 text-blue">Enquiry</p></Reveal>
            <Reveal><h2 className="display text-[clamp(2.6rem,5.5vw,4.75rem)] text-navy">Got an idea? Let&apos;s hear it.</h2></Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink/70">
                Big project, tiny project, or something you&apos;ve only just imagined. Start the conversation.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-10 rounded-3xl border border-navy/10 bg-white p-6">
                <p className="font-semibold text-navy">Prefer a conversation?</p>
                <p className="mt-1 text-ink/70">Book a free 30-minute call.</p>
                <motion.a
                  href={SITE.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  className="mt-4 inline-flex items-center gap-2 font-semibold text-blue"
                >
                  <CalendarDays size={18} /> Pick a time <ArrowRight size={16} />
                </motion.a>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.1} className="md:col-span-7">
          <form onSubmit={onSubmit} noValidate className="rounded-[28px] border border-navy/10 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(16,26,53,0.25)] md:p-10" aria-describedby="form-status">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={label}>Name</label>
                <input id="name" name="name" required autoComplete="name" maxLength={80} className={field} placeholder="Your name" aria-invalid={!!errs.name} aria-describedby={errs.name ? "err-name" : undefined} />
                {errs.name && <p id="err-name" className="mt-1.5 text-sm text-red-600">{errs.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className={label}>Email address</label>
                <input id="email" name="email" type="email" required autoComplete="email" maxLength={254} className={field} placeholder="you@example.com" aria-invalid={!!errs.email} aria-describedby={errs.email ? "err-email" : undefined} />
                {errs.email && <p id="err-email" className="mt-1.5 text-sm text-red-600">{errs.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="business_name" className={label}>Business / project name <span className="font-normal text-navy/50">(optional)</span></label>
                <input id="business_name" name="business_name" autoComplete="organization" maxLength={120} className={field} placeholder="e.g. Meera's Bakery" />
              </div>
              <div>
                <label htmlFor="service_interest" className={label}>What do you want to build?</label>
                <select id="service_interest" name="service_interest" required defaultValue="" className={field} aria-invalid={!!errs.service_interest}>
                  <option value="" disabled>Choose one</option>
                  {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errs.service_interest && <p className="mt-1.5 text-sm text-red-600">{errs.service_interest}</p>}
              </div>
              <div>
                <label htmlFor="approximate_budget" className={label}>Approximate budget <span className="font-normal text-navy/50">(optional)</span></label>
                <select id="approximate_budget" name="approximate_budget" defaultValue="Not sure yet" className={field}>
                  {BUDGET_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="project_description" className={label}>Brief project description</label>
                <textarea id="project_description" name="project_description" required minLength={20} maxLength={3000} rows={5} className={field} placeholder="What are you dreaming of? Who is it for? Anything you've already got (logo, content, examples you like)…" aria-invalid={!!errs.project_description} aria-describedby={errs.project_description ? "err-desc" : undefined} />
                {errs.project_description && <p id="err-desc" className="mt-1.5 text-sm text-red-600">{errs.project_description}</p>}
              </div>
              <fieldset className="sm:col-span-2">
                <legend className={label}>Preferred contact method</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CONTACT_METHODS.map((m, i) => (
                    <label key={m} className="cursor-pointer">
                      <input type="radio" name="preferred_contact_method" value={m} defaultChecked={i === 0} className="peer sr-only" />
                      <span className="inline-block rounded-full border border-navy/15 px-4 py-2 text-sm font-medium text-navy transition peer-checked:border-blue peer-checked:bg-blue peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-blue/20">{m}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {/* Honeypot — hidden from humans, tempting for bots */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <motion.button
                type="submit"
                disabled={status.kind === "sending"}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-blue px-8 text-base font-semibold text-white disabled:opacity-70"
              >
                {status.kind === "sending" ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {status.kind === "sending" ? "Sending…" : "Send my idea"}
              </motion.button>
              <p className="text-sm text-navy/50">We reply within a couple of days. No spam, ever.</p>
            </div>

            <div id="form-status" role="status" aria-live="polite" className="mt-6">
              <AnimatePresence mode="wait">
                {status.kind === "ok" && (
                  <motion.p key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ ease: EASE, duration: 0.5 }} className="flex items-start gap-3 rounded-2xl bg-sky p-4 text-navy">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-blue" size={20} />
                    <span><b>Got it. Thank you.</b> Your idea is safely with us — we&apos;ll be in touch soon.</span>
                  </motion.p>
                )}
                {status.kind === "error" && (
                  <motion.p key="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ ease: EASE, duration: 0.5 }} className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-red-800">
                    <AlertCircle className="mt-0.5 shrink-0" size={20} />
                    <span>{status.message}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
