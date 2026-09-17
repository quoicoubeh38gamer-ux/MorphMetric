import Link from "next/link";
import { ScanFace } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
        <ScanFace className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">MorphMetric</span>
    </Link>
  );
}
