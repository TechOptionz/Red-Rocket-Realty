import type { Metadata, Viewport } from "next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";
import "./home.css";
import "./pages.css";
import RevealObserver from "@/components/RevealObserver";
import BackToTop from "@/components/BackToTop";

const rhd = Red_Hat_Display({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"], variable: "--font-rhd", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Red Rocket Realty · Springwood, Logan", template: "%s · Red Rocket Realty" },
  description: "Red Rocket Realty is committed to the property needs of Logan residents. Buying, selling and renting across Logan for over 25 years.",
  icons: { icon: [{ url: "/brand/favicon.ico", sizes: "32x32" }, { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" }, { url: "/brand/favicon-192.png", type: "image/png", sizes: "192x192" }], apple: "/brand/apple-touch-icon.png" },
};

// viewport-fit=cover lets env(safe-area-inset-*) work on notched phones; the theme colour matches the solid header.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#16181d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the home intro's inline boot script sets data-intro-on on <html> before React hydrates
    // (so the panel covers the page from the first paint). It only silences attribute diffs on this one element.
    <html lang="en-AU" className={rhd.variable} suppressHydrationWarning>
      <body>
        <RevealObserver />
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
