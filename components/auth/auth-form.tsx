"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2, Lock, Mail, User } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Logo } from "@/components/site/logo";
import { Aurora } from "@/components/ui/aurora";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-10 py-2.5 text-sm outline-none transition-colors focus:border-primary/60";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = isSignup
        ? await authClient.signUp.email({ email, password, name: name.trim() || email.split("@")[0] || "there" })
        : await authClient.signIn.email({ email, password });

      if (res.error) {
        const status = res.error.status;
        setError(
          status === 503
            ? "Accounts aren't live yet — the database isn't connected. (Everything else works!)"
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
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
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
              placeholder={isSignup ? "Password (min 8 characters)" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </Field>

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
