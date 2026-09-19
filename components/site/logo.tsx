import Link from "next/link";
import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-2xl bg-divine text-primary-foreground shadow-glow transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
        {/* breathing halo ring */}
        <span className="absolute inset-0 rounded-2xl ring-1 ring-halo-gold/50 animate-halo-breathe" />
        <Sparkle className="h-5 w-5 drop-halo" strokeWidth={2.2} fill="currentColor" />
      </span>
      <span className="font-display text-2xl font-semibold tracking-tight">
        Morph<span className="text-primary">Metric</span>
      </span>
    </Link>
  );
}
