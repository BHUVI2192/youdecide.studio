import { revalidatePath } from "next/cache";
import { denyUnlessAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { contributionSchema } from "@/lib/validation";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f-]{36}$/i;

export async function PUT(req: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Bad id" }, { status: 400 });
  const parsed = contributionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 422 });
  const { private_contact_name, private_contact_email, private_notes, ...pub } = parsed.data;
  const db = createAdminClient();
  const { error } = await db.from("contributions").update(pub).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await db.from("contribution_private").upsert({
    contribution_id: id,
    contact_name: private_contact_name,
    contact_email: private_contact_email,
    notes: private_notes,
  });
  revalidatePath("/");
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Bad id" }, { status: 400 });
  const { error } = await createAdminClient().from("contributions").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath("/");
  return Response.json({ ok: true });
}
