import React from "react";

interface FeedCardProps {
  category: string;
  headline: string;
  time: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  "Market": "bg-accent-blue text-white",
  "Macro": "bg-accent-teal text-ink",
  "Earnings": "bg-accent-yellow text-ink",
  "Geopolitics": "bg-accent-coral text-white",
  "Crypto": "bg-ink text-bg",
  "Forex": "bg-accent-pink text-ink",
};

export function FeedCard({ category, headline, time, className = "" }: FeedCardProps) {
  const catColor = categoryColors[category] || "bg-accent-yellow text-ink";

  return (
    <div
      className={`brutal-border border-2 border-ink p-4 card-lift cursor-default bg-bg ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider brutal-border border-2 border-ink ${catColor}`}
        >
          {category}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-snug mb-1">{headline}</p>
          <p className="text-[10px] font-black uppercase tracking-wider opacity-40">{time}</p>
        </div>
      </div>
    </div>
  );
}