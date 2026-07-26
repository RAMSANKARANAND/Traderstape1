import React from "react";
import { StatusBadge } from "./StatusBadge";

interface MarketCardProps {
  name: string;
  price: string;
  change: string;
  trend: "bullish" | "bearish" | "neutral";
  className?: string;
}

export function MarketCard({ name, price, change, trend, className = "" }: MarketCardProps) {
  return (
    <div
      className={`brutal-card p-5 card-lift cursor-default ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm uppercase tracking-wide">{name}</h3>
        <StatusBadge variant={trend} />
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-black font-mono tracking-tight">{price}</p>
        <p
          className={`text-xs font-black font-mono ${
            trend === "bullish"
              ? "text-accent-teal"
              : trend === "bearish"
              ? "text-accent-coral"
              : "text-ink/60"
          }`}
        >
          {change}
        </p>
      </div>
    </div>
  );
}