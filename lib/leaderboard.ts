import "server-only";
import { createPublicClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/env";
import { SITE } from "./config";
import type { PublicEntry } from "@/types";

// FICTIONAL preview rows. Only rendered when NEXT_PUBLIC_SHOW_DEMO_DATA=true,
// and always labelled DEMO in the UI. Never seeded as real data.
const DEMO: PublicEntry[] = [
  { id: "demo-1", display_name: "Local Business", project_name: "Website Development", service_type: "Website", amount: 5000, link_url: "", created_at: "2026-01-10T00:00:00Z", demo: true },
  { id: "demo-2", display_name: "Independent Creator", project_name: "Portfolio Website", service_type: "Website", amount: 2500, link_url: "", created_at: "2026-02-02T00:00:00Z", demo: true },
  { id: "demo-3", display_name: "Startup Founder", project_name: "Landing Page", service_type: "Website", amount: 8000, link_url: "", created_at: "2026-03-15T00:00:00Z", demo: true },
];

export async function getLeaderboard(): Promise<{ entries: PublicEntry[]; demo: boolean }> {
  if (supabaseConfigured()) {
    try {
      // The view already filters is_published AND consent, and masks anonymous rows.
      const { data, error } = await createPublicClient().from("public_leaderboard").select("*").order("amount", { ascending: false }).limit(100);
      if (!error && data && data.length) return { entries: data as PublicEntry[], demo: false };
      if (error) console.error("[leaderboard]", error.message);
    } catch (e) {
      console.error("[leaderboard]", e);
    }
  }
  if (SITE.showDemo) return { entries: DEMO, demo: true };
  return { entries: [], demo: false };
}
