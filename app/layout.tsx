import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { SITE } from "@/lib/config";

const geist = localFont({
  variable: "--font-geist",
  display: "swap",
  src: [
    { path: "../public/fonts/Geist-Light.ttf", weight: "300" },
    { path: "../public/fonts/Geist-Regular.ttf", weight: "400" },
    { path: "../public/fonts/Geist-Medium.ttf", weight: "500" },
    { path: "../public/fonts/Geist-SemiBold.ttf", weight: "600" },
    { path: "../public/fonts/Geist-Bold.ttf", weight: "700" },
  ],
});
const geistMono = localFont({
  variable: "--font-geist-mono",
  display: "swap",
  src: [
    { path: "../public/fonts/GeistMono-Regular.ttf", weight: "400" },
    { path: "../public/fonts/GeistMono-Medium.ttf", weight: "500" },
  ],
});

const title = "youdecide.studio — A small budget should never mean a small dream.";
const description =
  "Websites, automation and analytics for people with big ideas and small budgets. No price tag up front: we build it, you decide what it's worth.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: title, template: "%s · youdecide.studio" },
  description,
  applicationName: "youdecide.studio",
  alternates: { canonical: "/" },
  openGraph: { title, description, url: SITE.url, siteName: "youdecide.studio", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image", title, description },
  icons: { icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "any" }], apple: "/icons/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
};
export const viewport: Viewport = { themeColor: "#315BDB", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
