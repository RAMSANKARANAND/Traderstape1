"use client";

import React, { useMemo } from "react";
import type { MarketQuote } from "@/lib/market/types";

interface LiveTickerProps {
  quotes: MarketQuote[];
}

const formatChange = (change: number): string => {
  const sign = change > 0 ? "▲" : change < 0 ? "▼" : "";
  return `${sign}${Math.abs(change).toFixed(2)}%`;
};

const TickerItem = React.memo(({ name, changePercent }: { name: string; changePercent: number }) => {
  const colorClass =
    changePercent > 0
      ? "text-green-600"
      : changePercent < 0
      ? "text-red-600"
      : "text-gray-500";

  return (
    <div
      className={`flex items-center gap-2 px-4 whitespace-nowrap ${colorClass}`}
      aria-label={`${name} ${formatChange(changePercent)}`}
    >
      <span>{name}</span>
      <span>{formatChange(changePercent)}</span>
    </div>
  );
});

export const LiveTicker = React.memo(function LiveTicker({ quotes }: LiveTickerProps) {
  // Memoize ticker items to avoid unnecessary re-renders
  const tickerItems = useMemo(() => {
    return quotes.map((q) => (
      <TickerItem key={q.symbol} name={q.name} changePercent={q.changePercent ?? 0} />
    ));
  }, [quotes]);

  // Duplicate content for seamless infinite marquee
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div
      className="overflow-hidden whitespace-nowrap h-11 bg-white flex items-center border-t border-b border-[#111]"
      style={{ height: "44px" }}
      aria-label="Live Market Ticker"
      role="region"
    >
      <div
        className="flex gap-2 w-max animate-marquee"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "running";
        }}
      >
        {duplicatedItems.reduce((acc, item, index) => {
          if (index === 0) return [item];
          return [...acc, <span key={`sep-${index}`} className="text-gray-400 select-none">|</span>, item];
        }, [] as React.ReactNode[])}
      </div>
    </div>
  );
});