"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { store } from "@/lib/store";

const CONFIRM_WORD = "DELETE";

/**
 * Permanent account deletion.
 *
 * The typed confirmation is not decoration: this is irreversible and the
 * button sits next to reversible ones. Local data is cleared too, so the
 * browser does not keep showing reports for an account that no longer exists.
 */
export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const armed = typed.trim().toUpperCase() === CONFIRM_WORD;

  async function destroy() {
    if (!armed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not delete the account. Please try again.");
        setBusy(false);
        return;
      }
      // The server row is gone; clear this device too so nothing lingers.
      store.clearAll();
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-danger">
        <Trash2 className="h-4 w-4" />
        Delete account
      </Button>

      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Delete your account">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted">
            This removes your account and everything attached to it — your analysis
            history, your plan and your progress. It happens immediately and{" "}
            <strong className="text-foreground">cannot be undone</strong>. We keep no copy.
          </p>
          <p className="text-sm leading-relaxed text-muted">
            If you have a paid plan, cancel it first — deleting the account does not
            refund the current period.
          </p>

          <div>
            <label htmlFor="confirm-delete" className="mb-1.5 block text-sm text-muted">
              Type <span className="font-mono text-foreground">{CONFIRM_WORD}</span> to confirm
            </label>
            <input
              id="confirm-delete"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-base outline-none transition-colors focus:border-danger/60 sm:py-2.5 sm:text-sm"
            />
          </div>

          {error ? (
            <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Keep my account
            </Button>
            <Button
              onClick={destroy}
              disabled={!armed || busy}
              className="bg-danger text-white hover:opacity-90"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete permanently
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
