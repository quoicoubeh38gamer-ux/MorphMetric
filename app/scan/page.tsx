import type { Metadata } from "next";
import { ScanFlow } from "@/components/scan/scan-flow";

export const metadata: Metadata = {
  title: "Scan",
  description: "Run your MorphMetric analysis — profile, on-device quality check, then a private scan.",
};

export default function ScanPage() {
  return (
    <div className="container py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Start your analysis</h1>
        <p className="mt-3 text-muted">
          Three quick steps. Your photo stays on your device — only anonymous
          measurements are scored.
        </p>
      </div>
      <div className="mt-10">
        <ScanFlow />
      </div>
    </div>
  );
}
