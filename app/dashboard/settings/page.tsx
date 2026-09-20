"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, FileDown, ShieldCheck } from "lucide-react";
import { store, type ConsentRecord, type Settings } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Loading } from "@/components/dashboard/empty-state";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteAccount } from "@/components/account/delete-account";

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5 last:border-0">
      <div className="max-w-md">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

/** Two-step confirm — destructive actions should never be one stray click. */
function DangerButton({ label, confirmLabel, onConfirm }: { label: string; confirmLabel: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      type="button"
      onClick={() => (armed ? (onConfirm(), setArmed(false)) : setArmed(true))}
      className={`focus-ring rounded-full border px-4 py-2 text-[0.8125rem] transition-colors ${
        armed
          ? "border-danger/50 bg-danger/10 text-danger"
          : "border-border text-muted hover:border-danger/40 hover:text-danger"
      }`}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}

export default function SettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<Settings>({ saveHistory: true });
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    setSettings(store.getSettings());
    setConsent(store.getConsent());
    setLoaded(true);
  }, []);

  function flash(msg: string) {
    setDone(msg);
    setTimeout(() => setDone(null), 2500);
  }

  function toggleHistory() {
    const next = { saveHistory: !settings.saveHistory };
    store.setSettings(next);
    setSettings(store.getSettings());
    flash(next.saveHistory ? "History on" : "History off — future analyses stay ephemeral");
  }

  if (!loaded) return <Loading />;

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your data, your controls. Everything here acts on this browser immediately — there is no server copy to request."
      />

      {done ? (
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs">
          <Check className="h-3.5 w-3.5 text-accent" /> {done}
        </p>
      ) : null}

      <section className="card-base mt-8 px-6 py-1">
        <Row
          title="Consent"
          description={
            consent
              ? `Given on ${new Date(consent.acceptedAt).toLocaleDateString()} (version ${consent.version}). Withdrawing means the next scan will ask again.`
              : "No consent on file. You will be asked before your next analysis."
          }
        >
          {consent ? (
            <div className="flex items-center gap-3">
              <Badge tone="success"><ShieldCheck className="h-3.5 w-3.5" /> Given</Badge>
              <DangerButton
                label="Withdraw"
                confirmLabel="Confirm withdraw"
                onConfirm={() => {
                  store.revokeConsent();
                  setConsent(null);
                  flash("Consent withdrawn");
                }}
              />
            </div>
          ) : (
            <Badge tone="default">Not given</Badge>
          )}
        </Row>

        <Row
          title="Save analysis history"
          description="When off, an analysis is shown once and never written to storage — no history, no comparisons, nothing left behind."
        >
          <button
            type="button"
            role="switch"
            aria-checked={settings.saveHistory}
            onClick={toggleHistory}
            className={`focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              settings.saveHistory ? "bg-accent" : "bg-border"
            }`}
          >
            <span className="sr-only">Save analysis history</span>
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-soft transition-transform ${
                settings.saveHistory ? "translate-x-[1.375rem]" : "translate-x-0.5"
              }`}
            />
          </button>
        </Row>

        <Row
          title="Export a report"
          description="Generate a printable report of your latest analysis and save it as a PDF."
        >
          <ButtonLink href="/report" variant="secondary" size="sm">
            <FileDown className="h-3.5 w-3.5" /> Open report
          </ButtonLink>
        </Row>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl tracking-tight">Delete data</h2>
        <div className="card-base mt-4 border-danger/20 px-6 py-1">
          <Row
            title="Delete all analyses"
            description="Removes every saved scan, your history and the current result. Settings and consent stay."
          >
            <DangerButton
              label="Delete analyses"
              confirmLabel="Confirm delete"
              onConfirm={() => {
                store.clearAnalyses();
                flash("All analyses deleted");
              }}
            />
          </Row>
          <Row
            title="Delete everything"
            description="Wipes every MorphMetric key from this browser — analyses, profile, habits, XP, plan progress, settings and consent."
          >
            <DangerButton
              label="Delete everything"
              confirmLabel="Confirm wipe"
              onConfirm={() => {
                store.clearAll();
                setConsent(null);
                setSettings({ saveHistory: true });
                flash("Everything deleted");
              }}
            />
          </Row>
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          Deleting is permanent and cannot be undone. Read more about what we do and do not store on the{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            privacy page
          </Link>
          .
        </p>
      </section>

      {/* GDPR art. 17. The controls above clear this browser; this one removes
          the account itself and everything the server holds against it. */}
      <section className="mt-12">
        <h2 className="font-display text-xl tracking-tight">Your account</h2>
        <p className="mt-1.5 text-sm text-muted">
          Close your account and erase everything we hold for you.
        </p>
        <div className="mt-5">
          <Row
            title="Delete my account"
            description="Removes your account, your analysis allowance and every record attached to it, on our servers and on this device. Immediate, permanent, and it needs no request to us."
          >
            <DeleteAccount />
          </Row>
        </div>
      </section>
    </>
  );
}
