import React from "react";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  accent?: "yellow" | "mint" | "sky" | "lavender" | "peach" | "none";
}

const accentStyles: Record<string, string> = {
  yellow: "bg-accent-yellow",
  mint: "bg-accent-mint",
  sky: "bg-accent-sky",
  lavender: "bg-accent-lavender",
  peach: "bg-accent-peach",
  none: "bg-bg-surface",
};

export function Panel({ children, className = "", accent = "none" }: PanelProps) {
  return (
    <div
      className={`brutal-border brutal-shadow p-6 ${accentStyles[accent]} ${className}`}
    >
      {children}
    </div>
  );
}