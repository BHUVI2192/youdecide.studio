"use client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, X, Mail, Phone } from "lucide-react";
import { ENQUIRY_STATUSES } from "@/lib/config";
import { dateShort } from "@/lib/format";
import type { AdminEnquiry } from "@/types";


const badge: Record<string, string> = { New: "bg-blue text-white", Contacted: "bg-sky text-navy", "In Discussion": "bg-amber-100 text-amber-900", Converted: "bg-green-100 text-green-800", Closed: "bg-navy/10 text-navy/70" };
const mail: Record<string, string> = { sent: "text-green-700", pending: "text-amber-700", failed: "text-red-700" };

export function EnquiriesManager({ initial }: { initial: AdminEnquiry[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<AdminEnquiry | null>(null);
  const [notes, setNotes] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => (filter === "All" || r.status === filter) && (!s || [r.name, r.email, r.business_name, r.service_interest, r.project_description].join(" ").toLowerCase().includes(s)));
  }, [rows, q, filter]);

  async function patch(id: string, body: Partial<Pick<AdminEnquiry, "status" | "internal_notes">>) {
    const res = await fetch(`/api/admin/enquiries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...body } : r)));
      setOpen((o) => (o && o.id === id ? { ...o, ...body } : o));
      router.refresh();
    } else alert("Update failed");
  }
  async function remove(id: string) {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    if (res.ok) { setRows((rs) => rs.filter((r) => r.id !== id)); setOpen(null); router.refresh(); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="display text-4xl">Enquiries</h1><p className="mt-1 text-sm text-navy/60">{rows.length} total · {rows.filter((r) => r.status === "New").length} new</p></div>
        <div className="flex flex-wrap gap-2">
          <label className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, idea…" className="rounded-full border border-navy/15 bg-white py-2 pl-9 pr-4 text-sm focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/15" /></label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-full border border-navy/15 bg-white px-4 py-2 text-sm">
            <option>All</option>{ENQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="text-left text-navy/60"><tr>{["From", "Wants", "Budget", "Status", "Email", "Received", ""].map((h, i) => <th key={i} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="cursor-pointer border-t border-navy/10 hover:bg-sky/40" onClick={() => { setOpen(r); setNotes(r.internal_notes); }}>
                <td className="px-4 py-3"><p className="font-medium">{r.name}</p><p className="text-xs text-navy/50">{r.business_name || r.email}</p></td>
                <td className="px-4 py-3">{r.service_interest}</td>
                <td className="px-4 py-3 text-navy/70">{r.approximate_budget}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge[r.status] ?? ""}`}>{r.status}</span></td>
                <td className={`px-4 py-3 text-xs font-medium ${mail[r.email_delivery_status]}`} title={r.email_delivery_error ?? ""}>{r.email_delivery_status}</td>
                <td className="px-4 py-3 text-navy/60">{dateShort(r.created_at)}</td>
                <td className="px-4 py-3 text-right"><button aria-label="Delete" onClick={(e) => { e.stopPropagation(); remove(r.id); }} className="rounded-full p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/50">{rows.length ? "Nothing matches that filter." : "No enquiries yet."}</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end bg-navy/40" onClick={() => setOpen(null)}>
            <motion.aside initial={{ x: 60 }} animate={{ x: 0 }} exit={{ x: 60 }} transition={{ type: "spring", bounce: 0.1, duration: 0.5 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" data-lenis-prevent className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="display text-2xl">{open.name}</h2><p className="text-sm text-navy/60">{open.business_name || "—"} · {dateShort(open.created_at)}</p></div>
                <button aria-label="Close" onClick={() => setOpen(null)} className="rounded-full p-2 hover:bg-sky"><X size={18} /></button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <a href={`mailto:${open.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1.5 font-medium"><Mail size={14} /> {open.email}</a>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5"><Phone size={14} /> Prefers {open.preferred_contact_method}</span>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-navy/50">Wants to build</dt><dd className="font-medium">{open.service_interest}</dd></div>
                <div><dt className="text-navy/50">Approx. budget</dt><dd className="font-medium">{open.approximate_budget}</dd></div>
                <div><dt className="text-navy/50">Email delivery</dt><dd className={`font-medium ${mail[open.email_delivery_status]}`}>{open.email_delivery_status}{open.email_delivery_error && <span className="block text-xs font-normal text-red-700">{open.email_delivery_error}</span>}</dd></div>
                <div><dt className="text-navy/50">Status</dt><dd><select value={open.status} onChange={(e) => patch(open.id, { status: e.target.value })} className="mt-1 rounded-xl border border-navy/15 px-3 py-1.5 text-sm">{ENQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></dd></div>
              </dl>
              <p className="mt-6 text-xs font-medium tracking-widest text-blue">THE IDEA</p>
              <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-[#f6f9ff] p-4 text-[15px] leading-relaxed">{open.project_description}</p>
              <label className="mt-6 block text-sm font-medium">Internal notes
                <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/15" />
              </label>
              <div className="mt-3 flex justify-between">
                <button onClick={() => remove(open.id)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 size={16} /> Delete</button>
                <button onClick={() => patch(open.id, { internal_notes: notes })} className="rounded-full bg-blue px-5 py-2 text-sm font-semibold text-white">Save notes</button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
