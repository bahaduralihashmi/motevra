import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#f97316] text-white shadow-[0_24px_60px_rgba(249,115,22,0.22)] hover:bg-[#ea580c]",
  secondary:
    "bg-[#111827] text-white hover:bg-[#1f2937] border border-white/10",
  ghost:
    "bg-white/5 text-slate-100 backdrop-blur-sm border border-white/10 hover:bg-white/10",
};

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-[0.16em] uppercase transition-all duration-300 ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}
