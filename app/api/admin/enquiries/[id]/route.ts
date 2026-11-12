import { denyUnlessAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { enquiryPatchSchema } from "@/lib/validation";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f-]{36}$/i;

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Bad id" }, { status: 400 });
  const parsed = enquiryPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 422 });
  const { error } = await createAdminClient().from("enquiries").update(parsed.data).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Bad id" }, { status: 400 });
  const { error } = await createAdminClient().from("enquiries").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
