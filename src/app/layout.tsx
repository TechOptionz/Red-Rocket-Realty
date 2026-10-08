import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";
import "./home.css";
import "./pages.css";
import RevealObserver from "@/components/RevealObserver";

const rhd = Red_Hat_Display({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"], variable: "--font-rhd", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Red Rocket Realty · Springwood, Logan", template: "%s · Red Rocket Realty" },
  description: "Red Rocket Realty is committed to the property needs of Logan residents. Buying, selling and renting across Logan for over 25 years.",
  icons: { icon: "/brand/logo2-emblem.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={rhd.variable}>
      <body>
        <RevealObserver />
        {children}
      </body>
    </html>
  );
}
