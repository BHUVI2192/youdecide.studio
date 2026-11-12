import { createAdminClient } from "@/lib/supabase/server";
import { ContributionsManager } from "@/components/admin/ContributionsManager";
import type { AdminContribution } from "@/types";

export default async function Page() {
  const { data } = await createAdminClient()
    .from("contributions")
    .select("*, contribution_private(contact_name, contact_email, notes)")
    .order("created_at", { ascending: false });
  return <ContributionsManager initial={(data ?? []) as AdminContribution[]} />;
}
