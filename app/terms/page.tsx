import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL, GOVERNING_LAW, legalPlaceholdersRemaining } from "@/lib/legal";
import { Clause, LegalDoc, PlaceholderWarning } from "@/components/legal/doc";
import { FREE_SCAN_LIMIT } from "@/lib/quota";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The agreement between you and ${LEGAL.entityName} for using ${LEGAL.productName}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const missing = legalPlaceholdersRemaining();
  return (
    <LegalDoc
      title="Terms of Service"
      intro={`These terms are the agreement between you and the operator of ${LEGAL.productName}. They are written to be read, not to be skipped — if a clause here would surprise you, that is a problem with the clause.`}
      effectiveDate={LEGAL.effectiveDate}
    >
      <PlaceholderWarning missing={missing} />

      <Clause id="who" n={1} title="Who you are contracting with">
        <p>
          {LEGAL.productName} is operated by {LEGAL.entityName} ({LEGAL.entityForm}),
          established in {LEGAL.country}. Full identification details are on the{" "}
          <Link href="/legal" className="underline underline-offset-2 hover:text-foreground">
            legal notice
          </Link>{" "}
          page. Contact: {LEGAL.contactEmail}.
        </p>
        <p>
          By creating an account or using the service you accept these terms. If you do
          not accept them, do not create an account.
        </p>
      </Clause>

      <Clause id="age" n={2} title={`You must be ${LEGAL.minimumAge} or older`}>
        <p>
          An account requires you to be at least {LEGAL.minimumAge} years old. We ask for
          your date of birth at sign-up and check it on our servers; we do not store the
          date itself, only the fact that the check passed.
        </p>
        <p>
          This threshold exists so the service never needs to collect or verify parental
          consent. If we learn that an account belongs to someone under {LEGAL.minimumAge},
          we will delete it and its data.
        </p>
      </Clause>

      <Clause id="what" n={3} title="What the service does — and what it does not">
        <p>
          {LEGAL.productName} measures geometric relationships in a photograph of your
          face and compares them against reference ranges drawn from facial-anatomy
          literature. It returns those measurements, an explanation of each, and guidance
          labelled by how good the underlying evidence is.
        </p>
        <p>
          <strong className="text-foreground">It is not a beauty score</strong> and not a
          ranking of people. The number describes distance from an anatomical average. It
          is not comparable between two different people and we publish no leaderboard.
        </p>
        <p>
          <strong className="text-foreground">It is not medical advice.</strong> Nothing
          in the service diagnoses, treats, screens for or prevents any condition. It does
          not replace a doctor, dermatologist, dentist, orthodontist or psychologist. If
          you have a concern about your health, your skin, your growth or your
          relationship with your appearance, speak to a qualified professional.
        </p>
        <p>
          We do not recommend cosmetic procedures, and any decision you take about your
          body after using the service is yours alone.
        </p>
      </Clause>

      <Clause id="accuracy" n={4} title="Accuracy and its limits">
        <p>
          Measurements come from a single two-dimensional photograph. Lighting, camera
          angle, lens distortion, head tilt and expression all move the numbers, sometimes
          substantially. Depth-dependent readings are estimates and are labelled with
          lower confidence for that reason.
        </p>
        <p>
          We make no warranty that any measurement is accurate, and results should be read
          as an indication rather than a fact about your body.
        </p>
      </Clause>

      <Clause id="account" n={5} title="Your account">
        <p>
          You are responsible for keeping your password confidential and for activity
          under your account. Use an address you control — password recovery goes there.
        </p>
        <p>
          You may delete your account at any time from Settings. Deletion is immediate and
          irreversible, and removes your account together with everything attached to it.
        </p>
      </Clause>

      <Clause id="acceptable" n={6} title="What you may not do">
        <p>You agree not to:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            upload a photograph of someone else, or of anyone who has not agreed to it —
            in particular never a photograph of a child;
          </li>
          <li>
            use the service to rate, rank, compare or humiliate other people, whether
            privately or by publishing results;
          </li>
          <li>
            present results as a medical, diagnostic or professional assessment, or resell
            them as one;
          </li>
          <li>
            attempt to bypass the free-analysis allowance, automate requests, scrape the
            service, or probe it for vulnerabilities without written permission;
          </li>
          <li>copy the content of the service for a competing product.</li>
        </ul>
        <p>
          We may suspend or close an account that breaks these rules, and will say why when
          we do.
        </p>
      </Clause>

      <Clause id="plans" n={7} title="Free use, paid plans and billing">
        <p>
          A free account includes {FREE_SCAN_LIMIT} analyses. Beyond that, continued use
          requires a paid plan. The allowance is counted on our servers against your
          account.
        </p>
        <p>
          Prices, what each plan includes, and the billing period are shown before you pay
          and are confirmed by email. Paid plans renew automatically until you cancel;
          cancelling stops the next renewal and leaves you access until the end of the
          period you already paid for.
        </p>
        <p>
          If you are a consumer in the EU you normally have fourteen days to withdraw from
          a distance contract. Because the service is digital content supplied
          immediately, you are asked to consent to immediate supply at checkout and you
          acknowledge that doing so ends that right. Where we have got something wrong, we
          refund — ask at {LEGAL.contactEmail}.
        </p>
      </Clause>

      <Clause id="ip" n={8} title="Ownership">
        <p>
          The service, its design, its text and its scoring method belong to{" "}
          {LEGAL.entityName}. You get a personal, non-transferable right to use it; nothing
          here transfers ownership.
        </p>
        <p>
          Your photograph and your results are yours. Your photograph never reaches our
          servers at all — see the{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            privacy policy
          </Link>
          . We claim no licence over it.
        </p>
      </Clause>

      <Clause id="availability" n={9} title="Availability and changes">
        <p>
          The service is provided as it is. We do not promise it will be uninterrupted or
          error-free, and we may change or discontinue features.
        </p>
        <p>
          If we change these terms in a way that materially affects you, we will tell you
          before the change takes effect and you may close your account if you disagree.
        </p>
      </Clause>

      <Clause id="liability" n={10} title="Liability">
        <p>
          Nothing in these terms excludes liability that cannot lawfully be excluded —
          including for death or personal injury caused by negligence, for fraud, or for a
          consumer&apos;s statutory rights.
        </p>
        <p>
          Subject to that, we are not liable for indirect or consequential loss, and our
          total liability is limited to the greater of the amount you paid us in the twelve
          months before the claim, or fifty euros.
        </p>
        <p>
          You remain responsible for decisions you take about your own body, appearance or
          health.
        </p>
      </Clause>

      <Clause id="law" n={11} title="Governing law and disputes">
        <p>{GOVERNING_LAW}</p>
        <p>
          If you are a consumer you keep the protection of the mandatory rules of the
          country where you live, and you may bring proceedings in your own courts.
        </p>
        <p>
          Write to {LEGAL.contactEmail} first — most disputes are a misunderstanding that a
          reply resolves. Consumers in the EU may also use the European Commission&apos;s
          online dispute resolution platform.
        </p>
      </Clause>
    </LegalDoc>
  );
}
