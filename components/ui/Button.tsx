import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "ghostOnDark";

const base =
  "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-surface hover:shadow-surface-lg hover:brightness-[1.03] border border-slate-800/80",
  secondary:
    "bg-white/95 text-slate-900 border border-slate-200/90 shadow-surface hover:border-slate-300 hover:bg-cyan-50/40 hover:shadow-surface",
  ghost:
    "text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200/80 hover:bg-white/60",
  ghostOnDark:
    "text-white/95 border border-white/25 bg-white/5 hover:bg-white/10 hover:text-white",
};

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  variant?: Variant;
  children: ReactNode;
};

export function ButtonLink({
  className = "",
  variant = "primary",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

type NativeButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: NativeButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
