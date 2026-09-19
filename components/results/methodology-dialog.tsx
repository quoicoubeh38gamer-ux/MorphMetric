"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";

const STEPS = [
  {
    n: "01",
    t: "468-point mesh, on your device",
    d: "A vision model maps your face locally in the browser and extracts geometry. The photo itself is never uploaded, transmitted or stored.",
  },
  {
    n: "02",
    t: "Anatomical ratios",
    d: "Facial thirds, width-to-height, canthal tilt, eye spacing, nasal and mouth width, bigonial width and midline deviation are computed from that geometry.",
  },
  {
    n: "03",
    t: "Comparison to reference ranges",
    d: "Each measurement is compared to a neutral reference range drawn from classical proportion canons — a coordinate system, not a beauty standard. Closeness is expressed 0–20 and weighted into an overall index.",
  },
  {
    n: "04",
    t: "Stated limits",
    d: "Depth-dependent characteristics (nose projection, bridge, jaw bone) and surface properties (skin) cannot be judged reliably from one flat, front-lit photo. Those are labelled estimated and are never scored as if measured.",
  },
];

/** "How is this calculated?" — methodology and limits, one click from the score. */
export function MethodologyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-foreground/20 hover:text-foreground"
      >
        <HelpCircle className="h-3.5 w-3.5" /> How is this calculated?
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="How this is calculated"
        description="The full method, and what it deliberately does not claim."
      >
        <ol className="space-y-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border border-border bg-card p-5">
              <span className="font-mono text-xs text-accent">{s.n}</span>
              <p className="mt-2 font-medium">{s.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-2xl border border-border bg-background/60 p-5 text-xs leading-relaxed text-muted">
          The overall index is an internal, relative metric — useful as a baseline to compare
          against your own later scans. It is not a diagnosis, not medical advice, and not a
          measure of attractiveness or of a person&apos;s worth. Structural characteristics are
          reported as measurements, never as defects to correct.
        </p>
      </Modal>
    </>
  );
}
