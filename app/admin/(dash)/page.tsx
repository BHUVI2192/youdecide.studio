import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { inr, dateShort } from "@/lib/format";

export default async function Overview() {
  const db = createAdminClient();
  const [{ data: contribs }, { count: enquiries }, { count: pending }, { data: latest }] = await Promise.all([
    db.from("contributions").select("amount, is_published"),
    db.from("enquiries").select("id", { count: "exact", head: true }),
    db.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "New"),
    db.from("contributions").select("id, customer_display_name, service_type, amount, is_anonymous, is_published, created_at").order("created_at", { ascending: false }).limit(6),
  ]);
  const all = contribs ?? [];
  const total = all.reduce((s, c) => s + Number(c.amount), 0);
  const avg = all.length ? Math.round(total / all.length) : 0;
  const stats = [
    ["Total contributions", inr(total)], ["Projects", String(all.length)], ["Average contribution", inr(avg)],
    ["Published on the wall", String(all.filter((c) => c.is_published).length)], ["Total enquiries", String(enquiries ?? 0)], ["Pending enquiries", String(pending ?? 0)],
  ];
  return (
    <div>
      <h1 className="display text-4xl">Overview</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([k, v]) => (
          <li key={k} className="rounded-2xl border border-navy/10 bg-white p-5"><p className="text-sm text-navy/60">{k}</p><p className="display mt-2 text-3xl">{v}</p></li>
        ))}
      </ul>
      <div className="mt-10 flex items-center justify-between"><h2 className="text-xl font-semibold">Latest contributions</h2><Link href="/admin/contributions" className="text-sm font-medium text-blue">Manage →</Link></div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-navy/60"><tr>{["Customer", "Service", "Amount", "Status", "Date"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {(latest ?? []).map((c) => (
              <tr key={c.id} className="border-t border-navy/10">
                <td className="px-4 py-3 font-medium">{c.customer_display_name}{c.is_anonymous && <span className="ml-2 rounded bg-sky px-1.5 text-xs">anon</span>}</td>
                <td className="px-4 py-3">{c.service_type}</td>
                <td className="px-4 py-3 font-mono">{inr(Number(c.amount))}</td>
                <td className="px-4 py-3">{c.is_published ? <span className="text-green-700">Public</span> : <span className="text-navy/50">Private</span>}</td>
                <td className="px-4 py-3 text-navy/60">{dateShort(c.created_at)}</td>
              </tr>
            ))}
            {!latest?.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-navy/50">No contributions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
