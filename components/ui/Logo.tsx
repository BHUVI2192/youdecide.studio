/* eslint-disable @next/next/no-img-element */
// Approved Concept C wordmark, shipped unmodified from the brand package.
export function Logo({ variant = "colour", className = "h-6" }: { variant?: "colour" | "white" | "blue"; className?: string }) {
  return (
    <img
      src={`/images/youdecide-primary-horizontal_${variant}.svg`}
      alt="youdecide.studio"
      width={7720}
      height={921}
      className={`${className} w-auto`}
    />
  );
}
