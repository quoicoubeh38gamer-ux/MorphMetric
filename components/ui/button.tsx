import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "sheen group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-ring disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-divine text-primary-foreground shadow-glow hover:shadow-halo",
  secondary:
    "bg-card/80 text-foreground border border-border backdrop-blur hover:border-halo-gold/50 hover:text-primary hover:shadow-glow",
  outline:
    "border border-halo-gold/40 text-foreground hover:border-halo-gold hover:text-primary hover:shadow-glow",
  ghost: "text-muted hover:text-primary hover:bg-halo-gold/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
