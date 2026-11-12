import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Cookie-aware client acting as the signed-in user (anon key + their JWT). */
export async function createSessionClient() {
  const store = await cookies();
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component: refresh is handled elsewhere */
        }
      },
    },
  });
}

/** Anonymous public client (reads the masked leaderboard view only). */
export function createPublicClient() {
  return createClient(supabaseUrl(), supabaseAnonKey(), { auth: { persistSession: false } });
}

/** Service-role client. Server only. Bypasses RLS: always authorise first. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(supabaseUrl(), key, { auth: { persistSession: false, autoRefreshToken: false } });
}
