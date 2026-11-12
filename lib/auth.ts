import "server-only";
import { createAdminClient, createSessionClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/env";

export type AdminCheck =
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: "not-configured" | "signed-out" | "not-admin" };

/**
 * Server-side admin authorisation.
 * 1. getUser() asks Supabase Auth to validate the JWT (not just decode a cookie).
 * 2. The user id must exist in public.admin_users (checked with the service role).
 */
export async function checkAdmin(): Promise<AdminCheck> {
  if (!supabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return { ok: false, reason: "not-configured" };
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { ok: false, reason: "signed-out" };
  const { data: row } = await createAdminClient()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!row) return { ok: false, reason: "not-admin" };
  return { ok: true, userId: data.user.id, email: data.user.email ?? "" };
}

/** For API routes: returns a Response to send when unauthorised, else null. */
export async function denyUnlessAdmin(): Promise<Response | null> {
  const r = await checkAdmin();
  if (r.ok) return null;
  const status = r.reason === "signed-out" ? 401 : r.reason === "not-admin" ? 403 : 503;
  return Response.json({ error: r.reason }, { status });
}
