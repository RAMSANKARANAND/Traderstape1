"use client";

import React, { useMemo } from "react";
import { MarketQuote } from "@/lib/market/types";
import { formatPrice } from "@/lib/market/utils";

interface LiveMarketTickerProps {
  items: MarketQuote[];
  initialLastUpdated?: number;
}

const formatChange = (change: number): string => {
  const sign = change > 0 ? "\u25B2" : change < 0 ? "\u25BC" : "";
  return `${sign}${Math.abs(change).toFixed(2)}%`;
};

export function LiveMarketTicker({ items, initialLastUpdated }: LiveMarketTickerProps) {
  const lastUpdated = initialLastUpdated ?? Date.now();

  // Duplicate items for seamless marquee loop
  const duplicatedItems = useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className="flex items-center w-full bg-[var(--color-bg)] border-t border-b border-[var(--color-text)] overflow-hidden"
      style={{ height: "40px" }}
      aria-label="Live Market Ticker"
      role="region"
    >
      <div
        className="flex items-center gap-4 w-max animate-ticker"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "running";
        }}
      >
        {duplicatedItems.map((item, index) => {
          const isPositive = (item.changePercent ?? 0) > 0;
          const isNegative = (item.changePercent ?? 0) < 0;
          const changePercent = Math.abs(item.changePercent ?? 0);

          return (
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center gap-4 px-4 whitespace-nowrap"
            >
              {/* Label: Symbol name (bold Source Serif 4) */}
              <span className="font-serif font-bold text-[var(--color-text)]" style={{ lineHeight: 1 }}>
                {item.name}
              </span>

              {/* Value: Price (plain text with tabular numerals) */}
              <span className="font-feature-settings 'tnum' text-[var(--color-text)] text-[12px]" style={{ lineHeight: 1 }}>
                {formatPrice(item.price)}
              </span>

              {/* Change indicator: ▲/▼ + percent with tabular numerals */}
              <span
                className={`font-feature-settings 'tnum' ${
                  isPositive
                    ? "text-[var(--ng-positive)] font-bold"
                    : isNegative
                      ? "text-[var(--ng-negative)] font-bold"
                      : "text-[var(--color-neutral-500)]"
                }`}
                style={{ lineHeight: 1 }}
              >
                {isPositive ? "\u25B2" : isNegative ? "\u25BC" : ""}{changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}