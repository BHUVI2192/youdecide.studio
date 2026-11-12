import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { enquirySchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sendEnquiryEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(`${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? "salt"}`).digest("hex").slice(0, 32);

  if (!rateLimit(`enq:${ipHash}`, 5, 10 * 60_000)) {
    return Response.json({ ok: false, error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (JSON.stringify(body).length > 12_000) return Response.json({ ok: false, error: "Request too large." }, { status: 413 });

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
    return Response.json({ ok: false, error: "Please fix the highlighted fields.", fields }, { status: 422 });
  }
  const data = parsed.data;

  // Honeypot: bots fill the hidden field. Pretend success, store nothing.
  if (data.website) return Response.json({ ok: true });

  if (!supabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ ok: false, error: "Enquiries are temporarily unavailable. Please book a call instead." }, { status: 503 });
  }

  const db = createAdminClient();

  // Durable rate limit (works across serverless instances).
  const since = new Date(Date.now() - 60 * 60_000).toISOString();
  const [{ count: byIp }, { count: byEmail }] = await Promise.all([
    db.from("enquiries").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since),
    db.from("enquiries").select("id", { count: "exact", head: true }).ilike("email", data.email).gte("created_at", since),
  ]);
  if ((byIp ?? 0) >= 5 || (byEmail ?? 0) >= 3) {
    return Response.json({ ok: false, error: "We already have your recent enquiries. We'll be in touch soon." }, { status: 429 });
  }

  // 1) Store first, so the enquiry is never lost if email fails.
  const { data: row, error } = await db
    .from("enquiries")
    .insert({
      name: data.name,
      email: data.email,
      business_name: data.business_name,
      service_interest: data.service_interest,
      project_description: data.project_description,
      approximate_budget: data.approximate_budget,
      preferred_contact_method: data.preferred_contact_method,
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (error || !row) {
    console.error("[enquiry] insert failed", error?.message);
    return Response.json({ ok: false, error: "We couldn't save your enquiry. Please try again or book a call." }, { status: 500 });
  }

  // 2) Email it. A failure is recorded for the admin, but the enquiry is safe.
  try {
    await sendEnquiryEmail(data, row.id);
    await db.from("enquiries").update({ email_delivery_status: "sent", email_delivery_error: null }).eq("id", row.id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[enquiry] email failed", msg);
    await db.from("enquiries").update({ email_delivery_status: "failed", email_delivery_error: msg.slice(0, 500) }).eq("id", row.id);
  }
  // The visitor's idea is saved either way.
  return Response.json({ ok: true });
}
