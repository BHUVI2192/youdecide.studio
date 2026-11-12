import { revalidatePath } from "next/cache";
import { denyUnlessAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { contributionSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { data, error } = await createAdminClient()
    .from("contributions")
    .select("*, contribution_private(contact_name, contact_email, notes)")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(req: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const parsed = contributionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 422 });
  const { private_contact_name, private_contact_email, private_notes, ...pub } = parsed.data;
  const db = createAdminClient();
  const { data, error } = await db.from("contributions").insert(pub).select("id").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (private_contact_name || private_contact_email || private_notes) {
    await db.from("contribution_private").insert({
      contribution_id: data.id,
      contact_name: private_contact_name,
      contact_email: private_contact_email,
      notes: private_notes,
    });
  }
  revalidatePath("/"); // refresh the public wall immediately
  return Response.json({ id: data.id }, { status: 201 });
}
