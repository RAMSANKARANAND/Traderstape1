import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "up" | "down" | "flat" | "default";
  className?: string;
}

const variantStyles: Record<string, string> = {
  up: "bg-accent-teal text-ink",
  down: "bg-accent-coral text-white",
  flat: "bg-accent-yellow text-ink",
  default: "bg-ink text-bg",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider brutal-border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}