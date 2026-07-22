import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "yellow" | "coral" | "teal" | "blue" | "pink" | "none";
}

const accentBorders: Record<string, string> = {
  yellow: "border-accent-yellow",
  coral: "border-accent-coral",
  teal: "border-accent-teal",
  blue: "border-accent-blue",
  pink: "border-accent-pink",
  none: "border-ink",
};

export function Card({ children, className = "", accent = "none" }: CardProps) {
  return (
    <div
      className={`brutal-card p-5 ${accentBorders[accent]} ${className}`}
    >
      {children}
    </div>
  );
}