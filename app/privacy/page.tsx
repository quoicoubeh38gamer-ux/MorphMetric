import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL, legalPlaceholdersRemaining } from "@/lib/legal";
import { Clause, LegalDoc, PlaceholderWarning, Rows } from "@/components/legal/doc";
import { DeleteDataButton } from "@/components/privacy/delete-data-button";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "Your photograph never leaves your device. This explains what does, why, for how long, and how to get rid of it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const missing = legalPlaceholdersRemaining();
  return (
    <LegalDoc
      title="Privacy policy"
      intro="Face photographs are sensitive, so this product was built not to collect them. Your image is processed in your browser and never uploaded. This page explains what does leave your device, why we are allowed to hold it, how long we keep it, and how to make us delete it."
      effectiveDate={LEGAL.effectiveDate}
    >
      <PlaceholderWarning missing={missing} />

      <Clause id="controller" n={1} title="Who is responsible">
        <p>
          The data controller is {LEGAL.entityName}, {LEGAL.address}, {LEGAL.country}.
          For anything in this policy, write to{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`} className="underline underline-offset-2">
            {LEGAL.privacyEmail}
          </a>
          .
        </p>
      </Clause>

      <Clause id="photo" n={2} title="Your photograph is not collected">
        <p>
          This is the part that matters most, so it comes first. Face detection runs
          entirely in your browser: the model is downloaded to your device, your image is
          processed on your own hardware, and it is discarded when you leave the page.
        </p>
        <p>
          There is no upload step, no storage bucket and no copy on our servers. That is a
          design decision with a consequence we think is worth stating plainly:{" "}
          <strong className="text-foreground">
            there is no photograph of you for us to lose in a breach, hand to a third
            party, or be compelled to produce.
          </strong>
        </p>
        <p>
          Because of this, we do not process biometric data within the meaning of GDPR
          art. 9. What reaches our servers is a short list of ratios — numbers like 0.47
          and +4.2° — which cannot be reversed into a picture of your face.
        </p>
      </Clause>

      <Clause id="what" n={3} title="What we actually process">
        <Rows
          rows={[
            {
              label: "Account details",
              value:
                "Your email address, an optional display name, and a hashed password. Needed to give you an account at all.",
            },
            {
              label: "Age check result",
              value: `Whether you met the ${LEGAL.minimumAge}+ threshold, and when it was checked. We ask for your date of birth in the form but do not store it — only the outcome.`,
            },
            {
              label: "Analysis counter",
              value:
                "A count of analyses run on your account, and the quality score of each. This is what the free allowance is measured against. No measurements and no results are stored server-side.",
            },
            {
              label: "Your reports",
              value:
                "Stored in your own browser, not on our servers. Clearing them in Settings removes them permanently.",
            },
            {
              label: "Technical logs",
              value:
                "Standard server logs (IP address, timestamp, path) produced by our host, used to keep the service running and to apply rate limits.",
            },
            {
              label: "Payment details",
              value:
                "Handled entirely by our payment provider. We never see or store your card number.",
            },
          ]}
        />
        <p>
          We run no advertising trackers, no analytics profile and no third-party tags on
          the analysis flow.
        </p>
      </Clause>

      <Clause id="basis" n={4} title="Why we are allowed to hold it">
        <Rows
          rows={[
            {
              label: "Account, analyses, billing",
              value:
                "Performance of the contract between us (GDPR art. 6(1)(b)) — we cannot give you an account without them.",
            },
            {
              label: "Age check, rate limiting, security logs",
              value:
                "Our legitimate interest in running a service that is safe for a young audience and not abused (art. 6(1)(f)), and our legal obligation not to process children's data without a basis.",
            },
            {
              label: "Accounting records",
              value:
                "Legal obligation (art. 6(1)(c)) — invoices must be kept for the period the tax authority requires.",
            },
          ]}
        />
      </Clause>

      <Clause id="retention" n={5} title="How long we keep it">
        <Rows
          rows={[
            { label: "Account and analysis counter", value: "Until you delete your account." },
            {
              label: "Inactive accounts",
              value: `Deleted after ${LEGAL.inactivityRetentionMonths} months without a sign-in.`,
            },
            { label: "Reports in your browser", value: "Until you clear them, or clear site data." },
            { label: "Server logs", value: "Short-lived, per our host's retention policy." },
            {
              label: "Invoices",
              value: "Kept for the statutory accounting period, which we cannot shorten.",
            },
          ]}
        />
      </Clause>

      <Clause id="sharing" n={6} title="Who else sees it">
        <p>
          We do not sell your data and we do not share it for advertising. It is handled by
          the providers that make the service run, and by nobody else:
        </p>
        <Rows
          rows={[
            { label: "Hosting", value: `${LEGAL.host.name} — serves the site.` },
            { label: "Database", value: `${LEGAL.database.name} — stores your account. ${LEGAL.database.region}.` },
            { label: "Payments", value: "Our payment provider — processes cards; we never receive them." },
            { label: "Email", value: "Our email provider — sends password resets and receipts." },
          ]}
        />
        <p>
          Where a provider is outside the EEA, transfers rely on the European
          Commission&apos;s standard contractual clauses.
        </p>
      </Clause>

      <Clause id="rights" n={7} title="Your rights">
        <p>Under GDPR you can, at any time:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-foreground">Delete everything</strong> (art. 17) —
            Settings has a delete-account control. It is immediate and irreversible, and
            needs no request to us.
          </li>
          <li>
            <strong className="text-foreground">Get a copy</strong> of your data (art. 15)
            and receive it in a portable format (art. 20).
          </li>
          <li>
            <strong className="text-foreground">Correct</strong> anything inaccurate (art.
            16), or <strong className="text-foreground">restrict</strong> and{" "}
            <strong className="text-foreground">object to</strong> processing (arts. 18,
            21).
          </li>
          <li>
            <strong className="text-foreground">Complain</strong> to a supervisory
            authority — in France, the CNIL.
          </li>
        </ul>
        <p>
          For anything not covered by the buttons in Settings, write to{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`} className="underline underline-offset-2">
            {LEGAL.privacyEmail}
          </a>
          . We answer within one month.
        </p>
      </Clause>

      <Clause id="cookies" n={8} title="Cookies">
        <p>
          We set one cookie: your session, so you stay signed in. It is strictly necessary
          to operate the service, which is why there is no consent banner asking you to
          accept tracking — there is no tracking to accept.
        </p>
        <p>
          Your theme choice, your consent record and your reports are kept in your
          browser&apos;s local storage, not in cookies, and are never sent to us.
        </p>
      </Clause>

      <Clause id="minors" n={9} title="Age">
        <p>
          An account requires you to be {LEGAL.minimumAge} or older, checked on our servers
          at sign-up. We chose that threshold so the service never needs to collect or
          verify parental consent.
        </p>
        <p>
          If you believe an account belongs to someone younger, tell us at{" "}
          {LEGAL.privacyEmail} and we will delete it.
        </p>
      </Clause>

      <Clause id="security" n={10} title="How it is protected">
        <p>
          Passwords are hashed, never stored in readable form. Traffic is encrypted in
          transit and the site sends HSTS. Scoring, quota enforcement and validation happen
          on the server, never in the browser, so a modified client cannot change a result.
          A Content-Security-Policy with a per-request nonce blocks injected scripts, and
          API responses are never cached or indexed.
        </p>
        <p>
          If a breach ever affects your rights we will notify the supervisory authority
          within 72 hours and tell you directly where the law requires it.
        </p>
      </Clause>

      <Clause id="erase" n={11} title="Erase what is on this device">
        <p>
          This clears every report, preference and consent record {LEGAL.productName} has
          stored in this browser. It does not delete your account — Settings does that.
        </p>
        <div className="pt-2">
          <DeleteDataButton />
        </div>
        <p className="pt-2">
          Related reading:{" "}
          <Link href="/learn/privacy-by-design" className="underline underline-offset-2 hover:text-foreground">
            where your data goes
          </Link>{" "}
          and the{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            terms of service
          </Link>
          .
        </p>
      </Clause>
    </LegalDoc>
  );
}
