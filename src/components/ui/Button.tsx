import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent-coral text-white brutal-border brutal-shadow hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0_#111]",
  secondary: "bg-accent-yellow text-ink brutal-border brutal-shadow hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0_#111]",
  danger: "bg-accent-coral text-white brutal-border brutal-shadow hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0_#111]",
  ghost: "bg-transparent text-ink brutal-border hover:bg-accent-yellow",
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
      className={`font-black uppercase tracking-wide transition-all duration-100 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}