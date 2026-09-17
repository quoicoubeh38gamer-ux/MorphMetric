import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-muted">
            Understand your features and habits. Improve what you can control —
            with clear confidence levels and evidence-tagged guidance.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Product</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/scan" className="hover:text-foreground">Start a scan</Link></li>
            <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link href="/growth" className="hover:text-foreground">Body &amp; Growth</Link></li>
            <li><Link href="/#pricing" className="hover:text-foreground">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Trust</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/privacy" className="hover:text-foreground">Privacy &amp; data</Link></li>
            <li><Link href="/#evidence" className="hover:text-foreground">How evidence works</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col gap-3 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MorphMetric. A demo product.</p>
          <p className="max-w-xl">
            The morphology score is an internal metric, not a measure of
            attractiveness or a person&apos;s worth. Guidance is educational and
            not medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
