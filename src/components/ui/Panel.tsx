import React from "react";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  accent?: "yellow" | "coral" | "teal" | "blue" | "pink" | "none";
}

const accentStyles: Record<string, string> = {
  yellow: "bg-accent-yellow",
  coral: "bg-accent-coral",
  teal: "bg-accent-teal",
  blue: "bg-accent-blue",
  pink: "bg-accent-pink",
  none: "bg-bg",
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