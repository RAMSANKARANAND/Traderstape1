import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white brutal-border brutal-shadow hover:bg-white hover:text-ink hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0_#000]",
  secondary: "bg-accent-yellow text-ink brutal-border brutal-shadow hover:bg-white hover:text-ink hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0_#000]",
  danger: "bg-accent-peach text-ink brutal-border brutal-shadow hover:bg-white hover:text-ink hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0_#000]",
  ghost: "bg-transparent text-ink brutal-border hover:bg-bg-surface",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`font-black uppercase tracking-wide btn-press transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}