"use client";

import React from "react";
import type { MarketQuote } from "@/lib/market/types";

interface LiveTickerProps {
  quotes: MarketQuote[];
}

function formatChange(change: number): string {
  const sign = change > 0 ? "▲" : change < 0 ? "▼" : "";
  return `${sign}${Math.abs(change).toFixed(2)}%`;
}

export function LiveTicker({ quotes }: LiveTickerProps) {
  // Filter and format quotes for ticker display
  const tickerItems = quotes.map((q) => {
    const changePercent = q.changePercent ?? 0;
    const displayChange = formatChange(changePercent);
    const colorClass =
      changePercent > 0
        ? "text-green-500"
        : changePercent < 0
        ? "text-red-500"
        : "text-gray-500";

    return (
      <span key={q.symbol} className={`whitespace-nowrap ${colorClass}`}>
        {q.name} {displayChange}
      </span>
    );
  });

  // Join items with thin separator "|"
  const tickerContent = tickerItems.reduce((prev, curr, index) => {
    if (index === 0) return [curr];
    return [...prev, <span key={`sep-${index}`} className="mx-2 text-text-secondary">|</span>, curr];
  }, [] as React.ReactNode[]);

  return (
    <div
      className="overflow-hidden whitespace-nowrap h-12 md:h-12 flex items-center bg-bg"
      style={{ height: "44px" }}
    >
      <div
        className="inline-block animate-marquee"
        style={{ willChange: "transform" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "running";
        }}
      >
        {tickerContent}
        {tickerContent}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}