"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Loader2, Lock, Mail, User } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Logo } from "@/components/site/logo";
import { Aurora } from "@/components/ui/aurora";
import { LEGAL } from "@/lib/legal";
import { checkAge } from "@/lib/auth/age-gate";

// text-base below sm: iOS Safari zooms the page on focus for any field under
// 16px, and never zooms back out. The compact size returns on desktop.
const inputCls =
  "w-full rounded-xl border border-border bg-background px-10 py-3 text-base outline-none transition-colors focus:border-primary/60 sm:py-2.5 sm:text-sm";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Collected, sent once, and never stored — the server checks it and drops it.
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        // Checked here purely so the message is instant; the server repeats
        // the same check and is the one that decides.
        const verdict = checkAge(birthDate);
        if (!verdict.ok) {
          setError(verdict.message);
          setLoading(false);
          return;
        }
      }

      const res = isSignup
        ? await authClient.signUp.email({
            email,
            password,
            name: name.trim() || email.split("@")[0] || "there",
            // The client proxy merges fetchOptions.body into the JSON body
            // (see better-auth/dist/client/proxy.mjs). Our route in front of
            // Better Auth reads this field, checks it, and strips it.
            fetchOptions: { body: { birthDate } },
          })
        : await authClient.signIn.email({ email, password });

      if (res.error) {
        const status = res.error.status;
        setError(
          status === 503
            ? "Accounts aren't live yet — the database isn't connected. (Everything else works!)"
            : status === 403
              ? res.error.message || `You need to be at least ${LEGAL.minimumAge} to create an account.`
              : res.error.message || "Something went wrong. Please try again.",
        );
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <Aurora />
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 font-display text-2xl tracking-tight">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isSignup ? "Start tracking your morphology & growth." : "Log in to continue your progress."}
          </p>
        </div>

        <form onSubmit={submit} className="card-base space-y-4 p-6 sm:p-8">
          {isSignup ? (
            <Field icon={<User className="h-4 w-4" />}>
              <input
                className={inputCls}
                aria-label="Name (optional)"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </Field>
          ) : null}

          <Field icon={<Mail className="h-4 w-4" />}>
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
          </Field>

          <Field icon={<Lock className="h-4 w-4" />}>
            <input
              type="password"
              required
              minLength={8}
              className={inputCls}
              aria-label={isSignup ? "Password, at least 8 characters" : "Password"}
              placeholder={isSignup ? "Password (min 8 characters)" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </Field>

          {isSignup ? (
            <div>
              <label htmlFor="birthDate" className="mb-1.5 block text-sm text-muted">
                Date of birth
              </label>
              <Field icon={<CalendarDays className="h-4 w-4" />}>
                <input
                  id="birthDate"
                  type="date"
                  required
                  className={inputCls}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  autoComplete="bday"
                />
              </Field>
              <p className="mt-1.5 text-xs text-muted-foreground">
                You must be {LEGAL.minimumAge} or older. We check this on our servers and
                keep only the result, never the date.
              </p>
            </div>
          ) : null}

          {isSignup ? (
            <p className="text-xs leading-relaxed text-muted">
              By creating an account you agree to the{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and the{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>
          ) : null}

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
            {isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        {!isSignup ? (
          <p className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="text-muted hover:text-foreground hover:underline">
              Forgot your password?
            </Link>
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">Log in</Link>
            </>
          ) : (
            <>
              New to MorphMetric?{" "}
              <Link href="/signup" className="text-primary hover:underline">Create an account</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
      {children}
    </div>
  );
}
