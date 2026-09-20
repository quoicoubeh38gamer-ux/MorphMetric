import Link from "next/link";
import { Logo } from "./logo";
import { LEGAL } from "@/lib/legal";

export function Footer() {
  return (
    <footer className="border-t border-border pb-safe">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-muted">
            Understand your features and habits. Improve what you can control —
            with clear confidence levels and evidence-tagged guidance.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Product</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/scan" className="inline-flex min-h-9 items-center hover:text-foreground">Start a scan</Link></li>
            <li><Link href="/dashboard" className="inline-flex min-h-9 items-center hover:text-foreground">Dashboard</Link></li>
            <li><Link href="/growth" className="inline-flex min-h-9 items-center hover:text-foreground">Body &amp; Growth</Link></li>
            <li><Link href="/#pricing" className="inline-flex min-h-9 items-center hover:text-foreground">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Learn</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/learn" className="inline-flex min-h-9 items-center hover:text-foreground">All guides</Link></li>
            <li><Link href="/learn/how-scoring-works" className="inline-flex min-h-9 items-center hover:text-foreground">How the score works</Link></li>
            <li><Link href="/learn/photo-guide" className="inline-flex min-h-9 items-center hover:text-foreground">Taking a good photo</Link></li>
            <li><Link href="/learn/what-this-is-not" className="inline-flex min-h-9 items-center hover:text-foreground">What this is not</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Trust</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/privacy" className="inline-flex min-h-9 items-center hover:text-foreground">Privacy policy</Link></li>
            <li><Link href="/terms" className="inline-flex min-h-9 items-center hover:text-foreground">Terms of Service</Link></li>
            <li><Link href="/legal" className="inline-flex min-h-9 items-center hover:text-foreground">Legal notice</Link></li>
            <li><Link href="/learn/privacy-by-design" className="inline-flex min-h-9 items-center hover:text-foreground">Where your data goes</Link></li>
            <li><Link href="/learn/evidence-tiers" className="inline-flex min-h-9 items-center hover:text-foreground">How evidence works</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col gap-3 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          {/* "A demo product" contradicted the Terms of Service, which describe
              a real paid service. Two legal statements that disagree are worse
              than either alone, so the copyright line now names the operator
              and the disclaimers live where they belong. */}
          <p>
            © {new Date().getFullYear()} {LEGAL.entityName.startsWith("TODO") ? LEGAL.productName : LEGAL.entityName}
          </p>
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
