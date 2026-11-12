import Link from "next/link";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { SignOut } from "@/components/admin/SignOut";

export const dynamic = "force-dynamic";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const auth = await checkAdmin();
  if (!auth.ok) {
    if (auth.reason === "signed-out") redirect("/admin/login");
    return (
      <main className="grid min-h-svh place-items-center px-5 text-center">
        <div className="max-w-md">
          <h1 className="display text-3xl">{auth.reason === "not-admin" ? "This account is not an admin." : "Admin is not configured."}</h1>
          <p className="mt-3 text-navy/70">
            {auth.reason === "not-admin"
              ? "Your login worked, but your user id is not in the admin_users table. See README → Create the first admin."
              : "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY."}
          </p>
          <div className="mt-6"><SignOut /></div>
        </div>
      </main>
    );
  }
  const links = [["/admin", "Overview"], ["/admin/contributions", "Wall of Trust"], ["/admin/enquiries", "Enquiries"]] as const;
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 pb-5">
        <div className="flex items-center gap-4"><Logo className="h-5" /><span className="eyebrow text-blue">Admin</span></div>
        <nav className="flex gap-1 rounded-full bg-white p-1 text-sm font-medium shadow-sm">
          {links.map(([href, l]) => <Link key={href} href={href} className="rounded-full px-4 py-2 hover:bg-sky">{l}</Link>)}
        </nav>
        <div className="flex items-center gap-3 text-sm text-navy/60"><span className="hidden sm:inline">{auth.email}</span><SignOut /></div>
      </header>
      <main className="py-8">{children}</main>
    </div>
  );
}
