import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "flat" | "up" | "down" | "bullish" | "bearish" | "neutral" | "ai" | "breaking" | "forex" | "crypto" | "gold" | "live";
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<string, string> = {
  default: "bg-white text-ink border-ink",
  flat: "bg-bg text-ink border-ink",
  up: "bg-bull text-[#0a2e14] border-ink",
  down: "bg-bear text-[#2a0a0d] border-ink",
  bullish: "badge-bullish",
  bearish: "badge-bearish",
  neutral: "badge-neutral",
  ai: "badge-ai",
  breaking: "badge-breaking",
  forex: "badge-forex",
  crypto: "badge-crypto",
  gold: "badge-gold",
  live: "badge-live",
};

export function Badge({ children, variant = "default", className = "", onClick }: BadgeProps) {
  const base = "inline-flex items-center px-2.5 py-1 border-[2px] font-bold text-[11px] uppercase tracking-wider";

  return (
    <span className={`${base} ${variantClasses[variant]} ${className}`} onClick={onClick}>
      {children}
    </span>
  );
}
