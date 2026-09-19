import type { Metadata } from "next";
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

// Set the theme before paint to avoid a flash. Defaults to the luminous
// light theme (the angelic daylight); honours an explicit stored choice.
const themeScript = `
(function(){try{
  var t = localStorage.getItem('mm:theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
}catch(e){ document.documentElement.setAttribute('data-theme','light'); }})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AnimatedBackground />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
