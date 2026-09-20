"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Logo } from "@/components/site/logo";
import { Aurora } from "@/components/ui/aurora";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-10 py-3 text-base outline-none transition-colors focus:border-primary/60 sm:py-2.5 sm:text-sm";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (res.error && res.error.status === 503) {
        setError("Accounts aren't live yet on this deployment.");
        setLoading(false);
        return;
      }
      // Anything else reports success regardless of the outcome — see below.
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <Aurora />
      <div className="relative w-full max-w-sm">
        <div className="text-center">
          <Logo />
          <h1 className="mt-6 font-display text-2xl tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm text-muted">
            Enter your email and we&apos;ll send you a link to choose a new one.
          </p>
        </div>

        {sent ? (
          <div className="card-base mt-8 p-6 text-center sm:p-8">
            <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              If an account exists for{" "}
              <span className="text-foreground">{email}</span>, a reset link is on its way.
              It is valid for one hour.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Nothing arrived? Check your spam folder, and make sure you typed the address
              you signed up with.
            </p>
            <Link
              href="/login"
              className="focus-ring mt-6 inline-flex min-h-11 items-center rounded-full text-sm text-primary hover:underline"
            >
              Back to log in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card-base mt-8 space-y-4 p-6 sm:p-8">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                className={inputCls}
                aria-label="Email address"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
              Send the link
            </button>

            <p className="text-center text-sm text-muted">
              <Link href="/login" className="hover:text-foreground hover:underline">
                Back to log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
