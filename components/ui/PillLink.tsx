"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

const styles = {
  primary: "bg-blue text-white shadow-[0_10px_30px_-10px_rgba(49,91,219,0.7)]",
  secondary: "border border-navy/15 bg-white/70 text-navy backdrop-blur",
} as const;

/** Pill-shaped call-to-action link with a spring hover/tap. */
export function PillLink({
  href, children, variant = "primary", external = false, className = "",
}: { href: string; children: ReactNode; variant?: keyof typeof styles; external?: boolean; className?: string }) {
  return (
    <motion.a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={`group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 text-base font-semibold ${styles[variant]} ${className}`}
    >
      {children}
    </motion.a>
  );
}
