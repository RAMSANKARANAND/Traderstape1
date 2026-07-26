import React from "react";

interface StatusBadgeProps {
  variant: "bullish" | "bearish" | "neutral" | "live" | "ai";
  className?: string;
}

const variantStyles: Record<string, string> = {
  bullish: "bg-accent-teal text-ink border-accent-teal",
  bearish: "bg-accent-coral text-white border-accent-coral",
  neutral: "bg-accent-yellow text-ink border-accent-yellow",
  live: "bg-accent-coral text-white border-accent-coral",
  ai: "bg-accent-blue text-white border-accent-blue",
};

const variantLabels: Record<string, string> = {
  bullish: "▲ Bullish",
  bearish: "▼ Bearish",
  neutral: "◆ Neutral",
  live: "● LIVE",
  ai: "AI",
};

export function StatusBadge({ variant, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider brutal-border animate-badge-pop ${variantStyles[variant]} ${className}`}
    >
      {variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      )}
      {variantLabels[variant]}
    </span>
  );
}