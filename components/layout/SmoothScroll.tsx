"use client";
import Lenis from "lenis";
import { useEffect, useState, type ReactNode } from "react";
import { LenisContext } from "@/hooks/useLenis";

/**
 * Lenis smooth scrolling for the public site.
 * - Drives the real document scroll, so Motion's useScroll / whileInView keep working.
 * - Handles in-page anchor links (#how, #contact…) with an offset for the fixed nav.
 * - Not started when the visitor prefers reduced motion: the browser scrolls natively.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({
      autoRaf: true,
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      anchors: true, // offset comes from scroll-padding-top in globals.css
      touchMultiplier: 1.2,
    });
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
