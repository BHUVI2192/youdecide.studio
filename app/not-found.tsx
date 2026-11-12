import Link from "next/link";
export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-white px-6 text-center">
      <div>
        <p className="eyebrow text-blue">404</p>
        <h1 className="display mt-4 text-5xl text-navy">This page doesn&apos;t exist.</h1>
        <p className="mt-4 text-ink/70">Your idea still does, though.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-blue px-6 py-3 font-medium text-white">Back home</Link>
      </div>
    </main>
  );
}
