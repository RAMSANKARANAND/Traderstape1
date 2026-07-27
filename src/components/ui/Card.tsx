import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "yellow" | "coral" | "teal" | "blue" | "pink" | "none";
}

const accentBorders: Record<string, string> = {
  yellow: "border-accent-gold",
  coral: "border-accent-bearish",
  teal: "border-accent-bullish",
  blue: "border-accent-info",
  pink: "border-accent-neutral",
  none: "border-ink",
};

export function Card({ children, className = "", accent = "none" }: CardProps) {
  return (
    <div
      className={`brutal-card p-5 card-lift ${accentBorders[accent]} ${className}`}
    >
      {children}
    </div>
  );
}