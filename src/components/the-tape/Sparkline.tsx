import React from "react";

interface SparklineProps {
  direction?: "up" | "down" | "flat";
  className?: string;
}

export function Sparkline({ direction = "flat", className = "" }: SparklineProps) {
  const color = direction === "up" ? "#4ADE80" : direction === "down" ? "#FB7185" : "#6B7280";

  return (
    <svg
      viewBox="0 0 120 40"
      preserveAspectRatio="none"
      className={`w-full h-10 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0,35 L15,28 L30,32 L45,18 L60,22 L75,10 L90,14 L105,6 L120,8"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}