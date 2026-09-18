"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient, useSession } from "@/lib/auth/client";

export function AuthButtons() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) return <div className="h-9 w-9" aria-hidden />;

  if (session?.user) {
    const label = session.user.name || session.user.email || "?";
    const initial = label.charAt(0).toUpperCase();
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          title={session.user.email ?? undefined}
          className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground"
        >
          {initial}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            router.push("/");
            router.refresh();
          }}
          aria-label="Sign out"
          className="focus-ring hidden h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground sm:inline-flex"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="hidden text-sm text-muted transition-colors hover:text-foreground sm:block">
      Log in
    </Link>
  );
}
