export const SITE = {
  name: "youdecide.studio",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://youdecide.studio",
  calendly: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/youdecide-std/30min",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  showDemo: process.env.NEXT_PUBLIC_SHOW_DEMO_DATA === "true",
  tagline: "A small budget should never mean a small dream.",
} as const;

export const NAV = [
  { label: "Work", href: "#build" },
  { label: "How It Works", href: "#how" },
  { label: "Wall of Trust", href: "#trust" },
  { label: "About", href: "#belief" },
  { label: "Contact", href: "#contact" },
] as const;

export const SERVICE_TYPES = [
  "Personal portfolio",
  "Small business website",
  "Startup landing page",
  "Automation",
  "Analytics & BI",
  "Something else",
] as const;

export const CONTACT_METHODS = ["Email", "Phone call", "WhatsApp", "Video call"] as const;
export const BUDGET_OPTIONS = ["Not sure yet", "Under ₹5,000", "₹5,000 – ₹15,000", "₹15,000 – ₹50,000", "₹50,000+"] as const;
export const ENQUIRY_STATUSES = ["New", "Contacted", "In Discussion", "Converted", "Closed"] as const;
