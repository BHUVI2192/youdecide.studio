"use client";
import { useRouter } from "next/navigation";
export function SignOut() {
  const r = useRouter();
  return (
    <button onClick={async () => { await fetch("/api/admin/sign-out", { method: "POST" }); r.replace("/admin/login"); r.refresh(); }} className="rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-medium hover:bg-sky">
      Sign out
    </button>
  );
}
