export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="grid min-h-svh place-items-center bg-white">
      <span className="h-1 w-24 animate-pulse rounded-full bg-blue" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
