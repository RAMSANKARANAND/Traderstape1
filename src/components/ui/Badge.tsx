import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "up" | "down" | "flat" | "default";
  className?: string;
}

const variantStyles: Record<string, string> = {
  up: "bg-accent-mint text-ink",
  down: "bg-accent-peach text-ink",
  flat: "bg-accent-lavender text-ink",
  default: "bg-accent-yellow text-ink",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider brutal-border animate-badge-pop ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}