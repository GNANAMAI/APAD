import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

interface LinkButtonProps {
  to: string;
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  variant = "primary",
  fullWidth,
  className = "",
  children,
}: LinkButtonProps) {
  return (
    <Link
      to={to}
      className={`${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}
