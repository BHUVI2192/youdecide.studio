import { createAdminClient } from "@/lib/supabase/server";
import { EnquiriesManager } from "@/components/admin/EnquiriesManager";
import type { AdminEnquiry } from "@/types";

export default async function Page() {
  const { data } = await createAdminClient().from("enquiries").select("*").order("created_at", { ascending: false });
  return <EnquiriesManager initial={(data ?? []) as AdminEnquiry[]} />;
}
