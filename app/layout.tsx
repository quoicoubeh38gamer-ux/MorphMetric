import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Manrope, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { siteUrl } from "@/lib/site-url";

// Manrope carries the interface. Instrument Serif is the editorial voice —
// used only for headlines, where its high contrast reads as considered rather
// than decorative.
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE = siteUrl();
const DESCRIPTION =
  "AI-powered visual analysis and evidence-based guidance to help you understand your features, habits and growth-related factors — then focus on what you can control.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "MorphMetric — Understand your morphology. Build your potential.",
    template: "%s · MorphMetric",
  },
  description: DESCRIPTION,
  applicationName: "MorphMetric",
  appleWebApp: { capable: true, title: "MorphMetric", statusBarStyle: "default" },
  keywords: [
    "morphology analysis",
    "facial analysis",
    "face scan",
    "self improvement",
    "styling",
    "skincare",
    "posture",
    "evidence-based",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "MorphMetric",
    url: SITE,
    title: "MorphMetric — Understand your morphology. Build your potential.",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "MorphMetric",
    description: DESCRIPTION,
  },
};

/**
 * Mobile viewport. `viewportFit: "cover"` lets the page use the full screen on
 * notched phones — globals.css then pays the safe-area insets back so nothing
 * hides under the notch or the home indicator. themeColor tints the browser
 * chrome so the app doesn't sit in a mismatched bar.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0f" },
  ],
};

// Set the theme before paint to avoid a flash. Defaults to the luminous
// light theme (the angelic daylight); honours an explicit stored choice.
const themeScript = `
(function(){try{
  var t = localStorage.getItem('mm:theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
}catch(e){ document.documentElement.setAttribute('data-theme','light'); }})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Minted per request by middleware.ts — without it the browser refuses our
  // inline scripts, which is exactly the point.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div className="print:hidden">
          <AnimatedBackground />
        </div>
        <div className="flex min-h-screen flex-col">
          <div className="print:hidden">
            <Navbar />
          </div>
          <main className="flex-1">{children}</main>
          <div className="print:hidden">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
