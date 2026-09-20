"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, Lock } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Logo } from "@/components/site/logo";
import { Aurora } from "@/components/ui/aurora";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-10 py-3 text-base outline-none transition-colors focus:border-primary/60 sm:py-2.5 sm:text-sm";

const MIN_LENGTH = 8;

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Better Auth redirects here with the token in the query string after
  // validating it; `error=INVALID_TOKEN` means it was expired or already used.
  const token = params.get("token") ?? "";
  const tokenError = params.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error) {
        setError(
          res.error.status === 503
            ? "Accounts aren't live yet on this deployment."
            : res.error.message || "That link is no longer valid. Request a new one.",
        );
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
      setTimeout(() => router.push("/login"), 2200);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const unusable = !token || tokenError;

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <Aurora />
      <div className="relative w-full max-w-sm">
        <div className="text-center">
          <Logo />
          <h1 className="mt-6 font-display text-2xl tracking-tight">Choose a new password</h1>
        </div>

        {unusable ? (
          <div className="card-base mt-8 p-6 text-center sm:p-8">
            <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              This link is invalid, already used, or older than an hour. Reset links are
              single-use on purpose.
            </p>
            <Link
              href="/forgot-password"
              className="focus-ring mt-6 inline-flex min-h-11 items-center rounded-full text-sm text-primary hover:underline"
            >
              Request a new link
            </Link>
          </div>
        ) : done ? (
          <div className="card-base mt-8 p-6 text-center sm:p-8">
            <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Your password has been changed. Taking you to the login page…
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="card-base mt-8 space-y-4 p-6 sm:p-8">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                minLength={MIN_LENGTH}
                className={inputCls}
                aria-label={`New password, at least ${MIN_LENGTH} characters`}
                placeholder={`New password (min ${MIN_LENGTH} characters)`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                className={inputCls}
                aria-label="Repeat the new password"
                placeholder="Repeat the new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error ? (
              <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save the new password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
