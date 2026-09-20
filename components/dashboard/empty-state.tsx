import { ScanLine } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/** Shared empty state for every dashboard page that needs an analysis first. */
export function NoAnalysis({ what = "this view" }: { what?: string }) {
  return (
    <div className="card-base mt-8 flex flex-col items-center px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-border text-muted">
        <ScanLine className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <h2 className="mt-6 font-display text-2xl tracking-tight">No analysis yet</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Run your first scan and {what} fills in with your own measurements.
      </p>
      <ButtonLink href="/scan" className="mt-7">
        Analyze My Face
      </ButtonLink>
    </div>
  );
}

export function Loading() {
  return (
    <div className="py-24 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  );
}
