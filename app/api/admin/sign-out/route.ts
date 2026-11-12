import { createSessionClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  return Response.json({ ok: true });
}
