"use client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";
import { inr, dateShort } from "@/lib/format";
import { Trust } from "@/components/sections/Trust";
import type { AdminContribution } from "@/types";


const empty = { customer_display_name: "", project_name: "", service_type: "Website", amount: 0, link_url: "", is_anonymous: false, consent_to_public_display: false, is_published: false, private_contact_name: "", private_contact_email: "", private_notes: "" };
type Draft = typeof empty;
const toDraft = (c: AdminContribution): Draft => ({
  customer_display_name: c.customer_display_name, project_name: c.project_name, service_type: c.service_type, amount: Number(c.amount), link_url: c.link_url,
  is_anonymous: c.is_anonymous, consent_to_public_display: c.consent_to_public_display, is_published: c.is_published,
  private_contact_name: c.contribution_private?.contact_name ?? "", private_contact_email: c.contribution_private?.contact_email ?? "", private_notes: c.contribution_private?.notes ?? "",
});

const input = "mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/15";

export function ContributionsManager({ initial }: { initial: AdminContribution[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null);
  const [sort, setSort] = useState<"amount" | "latest">("amount");
  const [preview, setPreview] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(() => [...rows].sort((a, b) => (sort === "amount" ? Number(b.amount) - Number(a.amount) : +new Date(b.created_at) - +new Date(a.created_at))), [rows, sort]);
  const publicEntries = useMemo(
    () => rows.filter((r) => r.is_published && r.consent_to_public_display).map((r) => ({
      id: r.id, display_name: r.is_anonymous ? "Anonymous" : r.customer_display_name, project_name: r.is_anonymous ? "" : r.project_name,
      service_type: r.service_type, amount: Number(r.amount), link_url: r.is_anonymous ? "" : r.link_url, created_at: r.created_at,
    })),
    [rows],
  );

  async function refresh() {
    const res = await fetch("/api/admin/contributions");
    if (res.ok) setRows(((await res.json()).data ?? []) as AdminContribution[]);
    router.refresh();
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true); setErr("");
    const res = await fetch(editing.id ? `/api/admin/contributions/${editing.id}` : "/api/admin/contributions", {
      method: editing.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing.draft),
    });
    setBusy(false);
    if (!res.ok) return setErr((await res.json().catch(() => ({}))).error ?? "Save failed");
    setEditing(null); await refresh();
  }
  async function remove(id: string) {
    if (!confirm("Delete this contribution permanently?")) return;
    const res = await fetch(`/api/admin/contributions/${id}`, { method: "DELETE" });
    if (res.ok) await refresh();
  }
  async function togglePublish(c: AdminContribution) {
    if (!c.is_published && !c.consent_to_public_display) return alert("Record the customer's explicit consent before publishing.");
    const d = { ...toDraft(c), is_published: !c.is_published };
    const res = await fetch(`/api/admin/contributions/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    if (res.ok) await refresh(); else alert((await res.json().catch(() => ({}))).error ?? "Failed");
  }
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEditing((s) => (s ? { ...s, draft: { ...s.draft, [k]: v } } : s));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="display text-4xl">Wall of Trust</h1><p className="mt-1 text-sm text-navy/60">{rows.length} entries · {publicEntries.length} public</p></div>
        <div className="flex flex-wrap gap-2">
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-full border border-navy/15 bg-white px-4 py-2 text-sm">
            <option value="amount">Sort: contribution</option><option value="latest">Sort: latest</option>
          </select>
          <button onClick={() => setPreview((p) => !p)} className="rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-medium">{preview ? "Hide" : "Preview"} public wall</button>
          <button onClick={() => setEditing({ draft: { ...empty } })} className="inline-flex items-center gap-1.5 rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Add entry</button>
        </div>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6 overflow-hidden rounded-3xl">
            <Trust entries={publicEntries} demo={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        <table className="w-full min-w-[840px] text-sm">
          <thead className="text-left text-navy/60"><tr>{["Customer", "Project / service", "Amount", "Consent", "Visibility", "Added", ""].map((h, i) => <th key={i} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.id} className="border-t border-navy/10">
                <td className="px-4 py-3"><p className="font-medium">{c.customer_display_name}</p>{c.is_anonymous && <span className="text-xs text-navy/50">shown as Anonymous</span>}</td>
                <td className="px-4 py-3"><p>{c.project_name || "—"}</p><p className="text-xs text-navy/50">{c.service_type}</p></td>
                <td className="px-4 py-3 font-mono">{inr(Number(c.amount))}</td>
                <td className="px-4 py-3">{c.consent_to_public_display ? <span className="text-green-700">Recorded</span> : <span className="text-amber-700">Not recorded</span>}</td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublish(c)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${c.is_published ? "bg-green-100 text-green-800" : "bg-navy/5 text-navy/70"}`}>
                    {c.is_published ? <Eye size={14} /> : <EyeOff size={14} />} {c.is_published ? "Public" : "Private"}
                  </button>
                </td>
                <td className="px-4 py-3 text-navy/60">{dateShort(c.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button aria-label="Edit" onClick={() => setEditing({ id: c.id, draft: toDraft(c) })} className="rounded-full p-2 hover:bg-sky"><Pencil size={16} /></button>
                    <button aria-label="Delete" onClick={() => remove(c.id)} className="rounded-full p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/50">No contributions yet. Add the first one when a customer decides.</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4" onClick={() => setEditing(null)}>
            <motion.form
              initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.98 }} transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              onSubmit={save} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="dlg-title"
              className="max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
            >
              <div className="flex items-center justify-between"><h2 id="dlg-title" className="display text-2xl">{editing.id ? "Edit entry" : "Add entry"}</h2><button type="button" aria-label="Close" onClick={() => setEditing(null)} className="rounded-full p-2 hover:bg-sky"><X size={18} /></button></div>
              <p className="mt-4 text-xs font-medium tracking-widest text-blue">PUBLIC DISPLAY FIELDS</p>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">Customer / business display name<input required value={editing.draft.customer_display_name} onChange={(e) => set("customer_display_name", e.target.value)} className={input} /></label>
                <label className="text-sm font-medium">Project (optional)<input value={editing.draft.project_name} onChange={(e) => set("project_name", e.target.value)} className={input} /></label>
                <label className="text-sm font-medium">Service type<input required value={editing.draft.service_type} onChange={(e) => set("service_type", e.target.value)} className={input} list="svc" /><datalist id="svc"><option>Website</option><option>Landing page</option><option>Portfolio</option><option>Automation</option><option>Analytics & BI</option></datalist></label>
                <label className="text-sm font-medium">Contribution (₹, whole rupees)<input required type="number" min={0} step={1} value={editing.draft.amount} onChange={(e) => set("amount", Number(e.target.value))} className={input} /></label>
                <label className="text-sm font-medium sm:col-span-2">Website / social link (optional)<input type="url" placeholder="https://" value={editing.draft.link_url} onChange={(e) => set("link_url", e.target.value)} className={input} /></label>
              </div>
              <div className="mt-4 grid gap-3 rounded-2xl bg-sky/60 p-4 text-sm">
                <label className="flex items-start gap-3"><input type="checkbox" checked={editing.draft.consent_to_public_display} onChange={(e) => set("consent_to_public_display", e.target.checked)} className="mt-1" /><span><b>Customer explicitly consented</b> to their name, project and contribution being shown publicly.</span></label>
                <label className="flex items-start gap-3"><input type="checkbox" checked={editing.draft.is_anonymous} onChange={(e) => set("is_anonymous", e.target.checked)} className="mt-1" /><span><b>Show as Anonymous</b> (name, project and link are hidden; amount and service still appear).</span></label>
                <label className="flex items-start gap-3"><input type="checkbox" disabled={!editing.draft.consent_to_public_display} checked={editing.draft.is_published} onChange={(e) => set("is_published", e.target.checked)} className="mt-1" /><span><b>Publish on the Wall of Trust</b>{!editing.draft.consent_to_public_display && <span className="text-navy/60"> — requires recorded consent</span>}</span></label>
              </div>
              <p className="mt-6 text-xs font-medium tracking-widest text-navy/60">PRIVATE (never shown publicly)</p>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">Contact name<input value={editing.draft.private_contact_name} onChange={(e) => set("private_contact_name", e.target.value)} className={input} /></label>
                <label className="text-sm font-medium">Contact email<input type="email" value={editing.draft.private_contact_email} onChange={(e) => set("private_contact_email", e.target.value)} className={input} /></label>
                <label className="text-sm font-medium sm:col-span-2">Internal notes<textarea rows={3} value={editing.draft.private_notes} onChange={(e) => set("private_notes", e.target.value)} className={input} /></label>
              </div>
              {err && <p role="alert" className="mt-4 text-sm text-red-600">{err}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-full px-5 py-2.5 text-sm font-medium hover:bg-sky">Cancel</button>
                <button disabled={busy} className="rounded-full bg-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
