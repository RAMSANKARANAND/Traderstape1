import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "yellow" | "mint" | "sky" | "lavender" | "peach" | "none";
}

const accentBorders: Record<string, string> = {
  yellow: "border-accent-yellow",
  mint: "border-accent-mint",
  sky: "border-accent-sky",
  lavender: "border-accent-lavender",
  peach: "border-accent-peach",
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