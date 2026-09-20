import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]";

const variants: Record<Variant, string> = {
  // Ink in light, off-white in dark. The only high-contrast element on screen.
  primary: "bg-primary text-primary-foreground shadow-soft hover:opacity-90",
  secondary:
    "border border-border bg-surface text-foreground shadow-soft hover:border-foreground/20 hover:bg-card",
  outline: "border border-border text-foreground hover:border-foreground/25 hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-foreground",
};

// Touch first: a finger needs ~44px, a cursor does not. Each size is sized
// for the thumb below sm: and returns to its compact desktop height above it.
const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.8125rem] sm:h-8 sm:px-3.5",
  md: "h-11 px-5 text-sm sm:h-10",
  lg: "h-12 px-7 text-[0.9375rem]",
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
