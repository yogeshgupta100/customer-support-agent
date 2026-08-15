import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent/40",
  secondary:
    "bg-surface text-foreground border border-border hover:border-foreground/30 disabled:opacity-40",
  ghost: "bg-transparent text-foreground-muted hover:text-foreground disabled:opacity-40",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
