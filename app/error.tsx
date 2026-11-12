"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center bg-white px-6 text-center">
      <div>
        <p className="eyebrow text-blue">Something went wrong</p>
        <h1 className="display mt-4 text-5xl text-navy">That didn&apos;t go to plan.</h1>
        <button onClick={reset} className="mt-8 rounded-full bg-blue px-6 py-3 font-medium text-white">Try again</button>
      </div>
    </main>
  );
}
