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

const TickerItem = React.memo(({ name, changePercent, isStale }: { name: string; changePercent: number; isStale?: boolean }) => {
  const gainColor = "text-green-600";
  const lossColor = "text-red-600";

  const changeClass = changePercent > 0
    ? gainColor
    : changePercent < 0
      ? lossColor
      : "text-[%239ca3]";

  return (
    <span className={`font-serif font-bold ${changeClass}`}>
      <span>{name}</span>
      <span className="font-feature-settings 'tnum' text-[11px]">
        {formatChange(changePercent)}
      </span>
    </span>
  );
});

export const LiveTicker = React.memo(function LiveTicker({ quotes }: LiveTickerProps) {
  // Memoize ticker items to avoid unnecessary re-renders
  const tickerItems = useMemo(() => {
    return quotes.map((q) => (
      <TickerItem key={q.symbol} name={q.name} changePercent={q.changePercent ?? 0} isStale={q.isStale} />
    ));
  }, [quotes]);

  // Duplicate content for seamless infinite marquee
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div
      className="w-full bg-[var(--color-bg)] border-t border-b border-[var(--color-text)] overflow-hidden whitespace-nowrap"
      style={{ height: "36px" }}
      aria-label="Live Market Ticker"
      role="region"
    >
      <div
        className="flex gap-2 w-max animate-ticker"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "running";
        }}
      >
        {duplicatedItems.reduce<React.ReactNode[]>((acc, item, index) => {
          if (index === 0) return [item];
          return [...acc, <span key={`sep-${index}`} className="text-[#6b7280] select-none">•</span>, item];
        }, [] as React.ReactNode[])}
      </div>
    </div>
  );
});