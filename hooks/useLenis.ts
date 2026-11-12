"use client";
import { createContext, useContext } from "react";
import type Lenis from "lenis";

/** The active Lenis instance, or null (reduced motion, admin pages, before mount). */
export const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);
