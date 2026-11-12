"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createBrowser } from "@/lib/supabase/browser";
import { Logo } from "@/components/ui/Logo";

export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr("");
    const fd = new FormData(e.currentTarget);
    const { error } = await createBrowser().auth.signInWithPassword({ email: String(fd.get("email")), password: String(fd.get("password")) });
    setBusy(false);
    if (error) return setErr("Sign-in failed. Check your email and password.");
    router.replace("/admin"); router.refresh();
  }

  return (
    <main className="grid min-h-svh place-items-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-navy/10 bg-white p-8 shadow-sm">
        <Logo className="h-5" />
        <h1 className="display mt-6 text-3xl">Admin sign in</h1>
        <p className="mt-2 text-sm text-navy/60">Only invited admin accounts can enter. There is no public sign-up.</p>
        {!configured && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Supabase is not configured. Add the NEXT_PUBLIC_SUPABASE_* variables.</p>}
        <label className="mt-6 block text-sm font-medium">Email<input name="email" type="email" required autoComplete="username" className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/15" /></label>
        <label className="mt-4 block text-sm font-medium">Password<input name="password" type="password" required autoComplete="current-password" className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/15" /></label>
        {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
        <button disabled={busy || !configured} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue py-3 font-semibold text-white disabled:opacity-60">
          {busy && <Loader2 size={16} className="animate-spin" />} Sign in
        </button>
      </form>
    </main>
  );
}
