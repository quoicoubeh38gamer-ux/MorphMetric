import type { Metadata } from "next";
import { LEGAL, legalPlaceholdersRemaining } from "@/lib/legal";
import { Clause, LegalDoc, PlaceholderWarning, Rows } from "@/components/legal/doc";

export const metadata: Metadata = {
  title: "Legal notice",
  description: `Who publishes and hosts ${LEGAL.productName}.`,
  alternates: { canonical: "/legal" },
};

/**
 * Publisher identification. In France this page is mandatory and its required
 * contents are set by the LCEN (art. 6-III): who publishes the site, how to
 * reach them, who directs publication, and who hosts it.
 */
export default function LegalNoticePage() {
  const missing = legalPlaceholdersRemaining();
  return (
    <LegalDoc
      title="Legal notice"
      intro={`Who is behind ${LEGAL.productName}, how to reach them, and where the service runs.`}
      effectiveDate={LEGAL.effectiveDate}
    >
      <PlaceholderWarning missing={missing} />

      <Clause id="publisher" n={1} title="Publisher">
        <Rows
          rows={[
            { label: "Service", value: LEGAL.productName },
            { label: "Operated by", value: `${LEGAL.entityName} (${LEGAL.entityForm})` },
            { label: "Registered address", value: LEGAL.address },
            { label: "Country of establishment", value: LEGAL.country },
            ...(LEGAL.registrationNumber && !LEGAL.registrationNumber.startsWith("TODO")
              ? [{ label: "Registration number", value: LEGAL.registrationNumber }]
              : []),
            ...(LEGAL.vatNumber ? [{ label: "VAT number", value: LEGAL.vatNumber }] : []),
            { label: "Director of publication", value: LEGAL.publicationDirector },
            {
              label: "Contact",
              value: (
                <a href={`mailto:${LEGAL.contactEmail}`} className="underline underline-offset-2">
                  {LEGAL.contactEmail}
                </a>
              ),
            },
          ]}
        />
      </Clause>

      <Clause id="host" n={2} title="Hosting">
        <p>
          The site is hosted by {LEGAL.host.name}, {LEGAL.host.address} —{" "}
          <a
            href={LEGAL.host.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {LEGAL.host.url.replace("https://", "")}
          </a>
          .
        </p>
        <p>
          Account data is stored by {LEGAL.database.name}. Region: {LEGAL.database.region}.
        </p>
        <p>
          Photographs are never uploaded and are therefore never hosted anywhere — see the
          privacy policy.
        </p>
      </Clause>

      <Clause id="ip" n={3} title="Intellectual property">
        <p>
          The design, text, illustrations, scoring method and source arrangement of{" "}
          {LEGAL.productName} are the property of {LEGAL.entityName}. Reproduction without
          written permission is not authorised.
        </p>
        <p>
          The public-health sources cited in the guidance belong to their respective
          organisations and are linked rather than reproduced.
        </p>
      </Clause>

      <Clause id="report" n={4} title="Reporting a problem">
        <p>
          To report unlawful content, a security vulnerability, or any other problem with
          the service, write to{" "}
          <a href={`mailto:${LEGAL.contactEmail}`} className="underline underline-offset-2">
            {LEGAL.contactEmail}
          </a>
          . Security reports are welcome and will not be met with legal action where the
          research was carried out in good faith and without harming users.
        </p>
      </Clause>
    </LegalDoc>
  );
}
