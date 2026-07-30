import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "yellow" | "mint" | "sky" | "lavender" | "peach" | "none";
  padding?: "none" | "sm" | "md" | "lg";
}

const accentBorders: Record<string, string> = {
  yellow: "border-accent-yellow",
  mint: "border-accent-mint",
  sky: "border-accent-sky",
  lavender: "border-accent-lavender",
  peach: "border-accent-peach",
  none: "border-ink",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className = "", accent = "none", padding = "md" }: CardProps) {
  return (
    <div
      className={`brutal-card brutal-shadow card-lift ${accentBorders[accent]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}